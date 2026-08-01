package app.lovable.mindfulmovement;

import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

/**
 * Mindful Movement Android shell.
 *
 * The app is a Capacitor remote-URL shell (see capacitor.config.ts), so when the
 * device is offline the hosted React app never loads and the browser-side
 * offline overlay can never run. Android would then show its own
 * "Webpage not available / ERR_NAME_NOT_RESOLVED" page.
 *
 * This activity intercepts main-frame connectivity failures and loads the
 * bundled offline page (capacitor-shell/index.html, copied by `cap sync` to
 * android/app/src/main/assets/public/index.html) instead.
 *
 * Notes:
 * - Only main-frame errors are handled, so a failed image or analytics request
 *   never replaces the whole app.
 * - Only connectivity error codes are handled; HTTP errors (4xx/5xx) and SSL
 *   errors fall through to the default behaviour. SSL errors are NOT bypassed.
 * - `showingOffline` prevents retry loops: while the offline page is displayed,
 *   another failed load will not re-trigger a reload of the offline page.
 */
public class MainActivity extends BridgeActivity {

    private static final String OFFLINE_PAGE = "file:///android_asset/public/index.html";

    /** True while the bundled offline page is the current document. */
    private boolean showingOffline = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final WebView webView = getBridge().getWebView();

        webView.setWebViewClient(new BridgeWebViewClient(getBridge()) {

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                // A remote navigation started successfully -> allow the offline
                // page to be shown again if this attempt also fails.
                if (url != null && !url.startsWith("file://")) {
                    showingOffline = false;
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (url != null && url.startsWith("file://")) {
                    showingOffline = true;
                }
            }

            @Override
            public void onReceivedError(
                WebView view,
                WebResourceRequest request,
                WebResourceError error
            ) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                    && request != null
                    && request.isForMainFrame()
                    && isConnectivityError(error.getErrorCode())) {

                    if (!showingOffline) {
                        showingOffline = true;
                        view.stopLoading();
                        view.loadUrl(OFFLINE_PAGE);
                    }
                    // Swallow the error so Android's default error page is never shown.
                    return;
                }

                super.onReceivedError(view, request, error);
            }

            /**
             * Only treat genuine connectivity problems as "offline".
             * Everything else (HTTP status errors, SSL, auth) is left alone.
             */
            private boolean isConnectivityError(int code) {
                return code == WebViewClient.ERROR_HOST_LOOKUP      // DNS failure (ERR_NAME_NOT_RESOLVED)
                    || code == WebViewClient.ERROR_CONNECT          // connection refused / failed
                    || code == WebViewClient.ERROR_TIMEOUT          // timeout
                    || code == WebViewClient.ERROR_IO               // network read/write failure
                    || code == WebViewClient.ERROR_UNKNOWN          // generic net error (no network)
                    || code == WebViewClient.ERROR_PROXY_AUTHENTICATION;
            }
        });
    }
}
