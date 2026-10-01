package com.disastermesh.app

import android.content.Context
import android.content.pm.PackageManager
import android.hardware.camera2.CameraAccessException
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Minimal React Native native bridge for real Android hardware camera flashlight control.
 * Uses Camera2 CameraManager.setTorchMode() on rear camera with FLASH_INFO_AVAILABLE.
 * Never requests camera preview or image capture.
 */
class ResqTorchModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val cameraManager: CameraManager? by lazy {
        reactContext.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
    }

    private var cachedCameraId: String? = null

    @Volatile
    private var isTorchOn: Boolean = false

    override fun getName(): String = "ResqTorchModule"

    private fun resolveCameraId(): String? {
        if (cachedCameraId != null) {
            return cachedCameraId
        }

        val manager = cameraManager ?: return null
        try {
            var frontFallbackId: String? = null
            for (id in manager.cameraIdList) {
                val chars = manager.getCameraCharacteristics(id)
                val hasFlash = chars.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true
                if (hasFlash) {
                    val facing = chars.get(CameraCharacteristics.LENS_FACING)
                    if (facing == CameraCharacteristics.LENS_FACING_BACK) {
                        cachedCameraId = id
                        return id
                    } else if (frontFallbackId == null) {
                        frontFallbackId = id
                    }
                }
            }
            cachedCameraId = frontFallbackId
            return cachedCameraId
        } catch (e: Exception) {
            return null
        }
    }

    @ReactMethod
    fun isTorchAvailable(promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val hasFeature = pm.hasSystemFeature(PackageManager.FEATURE_CAMERA_FLASH)
            if (!hasFeature) {
                promise.resolve(false)
                return
            }
            val cameraId = resolveCameraId()
            promise.resolve(cameraId != null)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun setTorchEnabled(enabled: Boolean, promise: Promise) {
        try {
            val manager = cameraManager
            if (manager == null) {
                promise.reject("CAMERA_SERVICE_UNAVAILABLE", "Camera service is unavailable on this device")
                return
            }

            val cameraId = resolveCameraId()
            if (cameraId == null) {
                promise.reject("TORCH_UNAVAILABLE", "No flash unit available on this device")
                return
            }

            manager.setTorchMode(cameraId, enabled)
            isTorchOn = enabled
            promise.resolve(enabled)
        } catch (e: CameraAccessException) {
            isTorchOn = false
            promise.reject("CAMERA_ACCESS_ERROR", e.localizedMessage ?: "Camera access exception", e)
        } catch (e: Exception) {
            isTorchOn = false
            promise.reject("TORCH_ERROR", e.localizedMessage ?: "Failed to set torch mode", e)
        }
    }

    @ReactMethod
    fun isTorchActive(promise: Promise) {
        promise.resolve(isTorchOn)
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        if (isTorchOn) {
            try {
                val manager = cameraManager
                val cameraId = cachedCameraId
                if (manager != null && cameraId != null) {
                    manager.setTorchMode(cameraId, false)
                    isTorchOn = false
                }
            } catch (ignored: Exception) {}
        }
    }
}
