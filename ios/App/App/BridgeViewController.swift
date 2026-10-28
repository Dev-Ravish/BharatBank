import Capacitor
import WebKit

/// WKWebView denies every getUserMedia() call unless something implements this
/// WKUIDelegate method (Apple: "If you don't implement this method, WebKit
/// denies all permission requests"). Capacitor's own view controller doesn't,
/// so mic access always failed. This only grants it to the app's own
/// configured server URL (capacitor.config.ts -> server.url).
class BridgeViewController: CAPBridgeViewController {

    override func capacitorDidLoad() {
        bridge?.webView?.uiDelegate = self
    }

    private lazy var trustedOrigin: (scheme: String, host: String, port: Int)? = {
        guard
            let configUrl = Bundle.main.url(forResource: "capacitor.config", withExtension: "json"),
            let data = try? Data(contentsOf: configUrl),
            let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
            let server = json["server"] as? [String: Any],
            let serverUrlString = server["url"] as? String,
            let serverUrl = URL(string: serverUrlString),
            let scheme = serverUrl.scheme,
            let host = serverUrl.host
        else { return nil }
        return (scheme, host, serverUrl.port ?? (scheme == "https" ? 443 : 80))
    }()
}

extension BridgeViewController: WKUIDelegate {
    @available(iOS 15.0, *)
    func webView(
        _ webView: WKWebView,
        requestMediaCapturePermissionFor origin: WKSecurityOrigin,
        initiatedByFrame frame: WKFrameInfo,
        type: WKMediaCaptureType,
        decisionHandler: @escaping (WKPermissionDecision) -> Void
    ) {
        guard
            let trusted = trustedOrigin,
            origin.protocol.caseInsensitiveCompare("https") == .orderedSame,
            origin.protocol.caseInsensitiveCompare(trusted.scheme) == .orderedSame,
            origin.host.caseInsensitiveCompare(trusted.host) == .orderedSame,
            origin.port == trusted.port
        else {
            decisionHandler(.deny)
            return
        }
        decisionHandler(.grant)
    }
}
