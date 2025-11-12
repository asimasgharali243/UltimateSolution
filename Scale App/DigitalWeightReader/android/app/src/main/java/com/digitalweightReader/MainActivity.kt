package com.DigitalWeightReader // 👈 make sure this matches your app package name

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "DigitalWeightReader"

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null) // ✅ add this line for React Navigation & react-native-screens
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
