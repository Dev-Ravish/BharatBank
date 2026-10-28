package com.bharatbank.app;

import android.Manifest;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getBridge().getWebView().setWebChromeClient(new TrustedWebChromeClient(getBridge()));
        ActivityCompat.requestPermissions(this, new String[] { Manifest.permission.RECORD_AUDIO }, 1);
    }
}
