package com.bharatbank.app;

import android.net.Uri;
import android.webkit.PermissionRequest;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebChromeClient;
import com.getcapacitor.Logger;

/**
 * Capacitor's BridgeWebChromeClient already runs the full runtime-permission flow for
 * mic/camera (request -> system dialog -> grant/deny) and every other WebView callback
 * (JS dialogs, file chooser, geolocation, fullscreen video). It does not check which
 * origin is asking, so it would grant mic access to any page the WebView ever loads.
 * This adds that one check, then defers to the parent class for everything else.
 */
public class TrustedWebChromeClient extends BridgeWebChromeClient {

    private final Bridge bridge;

    public TrustedWebChromeClient(Bridge bridge) {
        super(bridge);
        this.bridge = bridge;
    }

    @Override
    public void onPermissionRequest(final PermissionRequest request) {
        if (!isTrustedOrigin(request.getOrigin())) {
            Logger.warn("Denying WebView media permission request from untrusted origin: " + request.getOrigin());
            request.deny();
            return;
        }
        super.onPermissionRequest(request);
    }

    private boolean isTrustedOrigin(Uri origin) {
        String configuredUrl = bridge.getConfig().getServerUrl();
        if (origin == null || configuredUrl == null) return false;

        Uri trusted = Uri.parse(configuredUrl);
        return (
            "https".equalsIgnoreCase(origin.getScheme()) &&
            origin.getScheme().equalsIgnoreCase(trusted.getScheme()) &&
            origin.getHost() != null &&
            origin.getHost().equalsIgnoreCase(trusted.getHost()) &&
            portOf(origin) == portOf(trusted)
        );
    }

    private int portOf(Uri uri) {
        int port = uri.getPort();
        return port != -1 ? port : ("https".equalsIgnoreCase(uri.getScheme()) ? 443 : 80);
    }
}
