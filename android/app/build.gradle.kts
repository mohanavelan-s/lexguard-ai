plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val lexguardServerUrl = (
    project.findProperty("lexguardServerUrl") as String?
        ?: System.getenv("LEXGUARD_SERVER_URL")
        ?: "https://lexguard-ai-production-ab0a.up.railway.app"
).replace("\\", "\\\\").replace("\"", "\\\"")

android {
    namespace = "com.lexguard.ai"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.lexguard.ai"
        minSdk = 24
        targetSdk = 34
        versionCode = 2
        versionName = "1.1"
        buildConfigField("String", "SERVER_URL", "\"$lexguardServerUrl\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = "1.8"
    }

    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.webkit:webkit:1.9.0")
    implementation("androidx.core:core-splashscreen:1.0.1")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
    // FIX 3/7: Runtime permissions + location services
    implementation("androidx.activity:activity-ktx:1.8.2")
    implementation("com.google.android.gms:play-services-location:21.1.0")
}
