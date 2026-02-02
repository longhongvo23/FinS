package com.stockapp.userservice.service.util;

import com.stockapp.userservice.domain.enumeration.DeviceType;
import com.stockapp.userservice.service.SessionService.DeviceInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility class for parsing User-Agent strings and extracting device
 * information.
 */
public final class DeviceInfoParser {

    private static final Logger LOG = LoggerFactory.getLogger(DeviceInfoParser.class);

    private DeviceInfoParser() {
        // Utility class
    }

    /**
     * Parse User-Agent string to extract device information
     *
     * @param userAgent the User-Agent string
     * @param deviceId  optional device ID from client (for mobile apps)
     * @param location  optional location from IP geolocation
     * @return DeviceInfo object with parsed information
     */
    public static DeviceInfo parse(String userAgent, String deviceId, String location) {
        DeviceInfo info = new DeviceInfo();

        if (userAgent == null || userAgent.isBlank()) {
            info.setDeviceId(deviceId != null ? deviceId : UUID.randomUUID().toString());
            info.setDeviceName("Unknown Device");
            info.setDeviceType(DeviceType.WEB);
            info.setLocation(location);
            return info;
        }

        // Set device ID
        info.setDeviceId(deviceId != null ? deviceId : generateDeviceIdFromUserAgent(userAgent));
        info.setLocation(location);

        // Parse device type
        info.setDeviceType(parseDeviceType(userAgent));

        // Parse OS information
        parseOsInfo(userAgent, info);

        // Parse browser information
        parseBrowserInfo(userAgent, info);

        // Generate device name
        info.setDeviceName(generateDeviceName(info));

        LOG.debug("Parsed device info from User-Agent: {}", info.getDeviceName());
        return info;
    }

    private static String generateDeviceIdFromUserAgent(String userAgent) {
        // Generate a consistent device ID based on User-Agent hash
        return "ua-" + Math.abs(userAgent.hashCode());
    }

    private static DeviceType parseDeviceType(String userAgent) {
        String ua = userAgent.toLowerCase();

        // Check for mobile devices first
        if (ua.contains("iphone") || ua.contains("ipod")) {
            return DeviceType.MOBILE_IOS;
        }
        if (ua.contains("ipad")) {
            return DeviceType.TABLET;
        }
        if (ua.contains("android")) {
            if (ua.contains("mobile")) {
                return DeviceType.MOBILE_ANDROID;
            }
            return DeviceType.TABLET; // Android without "mobile" is usually tablet
        }

        // Check for desktop apps
        if (ua.contains("electron") || ua.contains("desktop")) {
            return DeviceType.DESKTOP_APP;
        }

        // Check for other mobile indicators
        if (ua.contains("mobile") || ua.contains("phone")) {
            return DeviceType.MOBILE_ANDROID; // Default mobile
        }

        // Default to web
        return DeviceType.WEB;
    }

    private static void parseOsInfo(String userAgent, DeviceInfo info) {
        String ua = userAgent.toLowerCase();

        // iOS
        Pattern iosPattern = Pattern.compile("\\((iphone|ipad|ipod);[^)]*os\\s+([\\d_]+)", Pattern.CASE_INSENSITIVE);
        Matcher iosMatcher = iosPattern.matcher(userAgent);
        if (iosMatcher.find()) {
            info.setOsName("iOS");
            info.setOsVersion(iosMatcher.group(2).replace("_", "."));
            return;
        }

        // Android
        Pattern androidPattern = Pattern.compile("android\\s+([\\d.]+)", Pattern.CASE_INSENSITIVE);
        Matcher androidMatcher = androidPattern.matcher(userAgent);
        if (androidMatcher.find()) {
            info.setOsName("Android");
            info.setOsVersion(androidMatcher.group(1));
            return;
        }

        // Windows
        if (ua.contains("windows")) {
            info.setOsName("Windows");
            if (ua.contains("windows nt 10")) {
                info.setOsVersion("10/11");
            } else if (ua.contains("windows nt 6.3")) {
                info.setOsVersion("8.1");
            } else if (ua.contains("windows nt 6.2")) {
                info.setOsVersion("8");
            } else if (ua.contains("windows nt 6.1")) {
                info.setOsVersion("7");
            } else {
                info.setOsVersion("");
            }
            return;
        }

        // macOS
        Pattern macPattern = Pattern.compile("mac os x\\s+([\\d_]+)", Pattern.CASE_INSENSITIVE);
        Matcher macMatcher = macPattern.matcher(userAgent);
        if (macMatcher.find()) {
            info.setOsName("macOS");
            info.setOsVersion(macMatcher.group(1).replace("_", "."));
            return;
        }
        if (ua.contains("macintosh") || ua.contains("mac os")) {
            info.setOsName("macOS");
            info.setOsVersion("");
            return;
        }

        // Linux
        if (ua.contains("linux") && !ua.contains("android")) {
            info.setOsName("Linux");
            info.setOsVersion("");
            return;
        }

        // Chrome OS
        if (ua.contains("cros")) {
            info.setOsName("Chrome OS");
            info.setOsVersion("");
            return;
        }

        info.setOsName("Unknown");
        info.setOsVersion("");
    }

    private static void parseBrowserInfo(String userAgent, DeviceInfo info) {
        // Order matters - check more specific browsers first

        // Edge (Chromium-based)
        Pattern edgePattern = Pattern.compile("edg[ea]?/([\\d.]+)", Pattern.CASE_INSENSITIVE);
        Matcher edgeMatcher = edgePattern.matcher(userAgent);
        if (edgeMatcher.find()) {
            info.setBrowserName("Edge");
            info.setBrowserVersion(edgeMatcher.group(1));
            return;
        }

        // Opera
        Pattern operaPattern = Pattern.compile("(?:opera|opr)/([\\d.]+)", Pattern.CASE_INSENSITIVE);
        Matcher operaMatcher = operaPattern.matcher(userAgent);
        if (operaMatcher.find()) {
            info.setBrowserName("Opera");
            info.setBrowserVersion(operaMatcher.group(1));
            return;
        }

        // Samsung Browser
        Pattern samsungPattern = Pattern.compile("samsungbrowser/([\\d.]+)", Pattern.CASE_INSENSITIVE);
        Matcher samsungMatcher = samsungPattern.matcher(userAgent);
        if (samsungMatcher.find()) {
            info.setBrowserName("Samsung Browser");
            info.setBrowserVersion(samsungMatcher.group(1));
            return;
        }

        // Chrome
        Pattern chromePattern = Pattern.compile("(?:chrome|crios)/([\\d.]+)", Pattern.CASE_INSENSITIVE);
        Matcher chromeMatcher = chromePattern.matcher(userAgent);
        if (chromeMatcher.find() && !userAgent.toLowerCase().contains("edg")) {
            info.setBrowserName("Chrome");
            info.setBrowserVersion(chromeMatcher.group(1));
            return;
        }

        // Safari
        Pattern safariPattern = Pattern.compile("version/([\\d.]+).*safari", Pattern.CASE_INSENSITIVE);
        Matcher safariMatcher = safariPattern.matcher(userAgent);
        if (safariMatcher.find()) {
            info.setBrowserName("Safari");
            info.setBrowserVersion(safariMatcher.group(1));
            return;
        }

        // Firefox
        Pattern firefoxPattern = Pattern.compile("(?:firefox|fxios)/([\\d.]+)", Pattern.CASE_INSENSITIVE);
        Matcher firefoxMatcher = firefoxPattern.matcher(userAgent);
        if (firefoxMatcher.find()) {
            info.setBrowserName("Firefox");
            info.setBrowserVersion(firefoxMatcher.group(1));
            return;
        }

        // IE
        Pattern iePattern = Pattern.compile("(?:msie |rv:)([\\d.]+)", Pattern.CASE_INSENSITIVE);
        Matcher ieMatcher = iePattern.matcher(userAgent);
        if (ieMatcher.find() && userAgent.toLowerCase().contains("trident")) {
            info.setBrowserName("Internet Explorer");
            info.setBrowserVersion(ieMatcher.group(1));
            return;
        }

        // Mobile app webview
        if (userAgent.toLowerCase().contains("capacitor") ||
                userAgent.toLowerCase().contains("cordova")) {
            info.setBrowserName("App WebView");
            info.setBrowserVersion("");
            return;
        }

        info.setBrowserName("Unknown");
        info.setBrowserVersion("");
    }

    private static String generateDeviceName(DeviceInfo info) {
        StringBuilder name = new StringBuilder();

        // Add browser name
        if (info.getBrowserName() != null && !info.getBrowserName().equals("Unknown")) {
            name.append(info.getBrowserName());
        } else {
            name.append("Browser");
        }

        name.append(" on ");

        // Add OS name
        if (info.getOsName() != null && !info.getOsName().equals("Unknown")) {
            name.append(info.getOsName());
        } else {
            // Use device type as fallback
            switch (info.getDeviceType()) {
                case MOBILE_IOS:
                    name.append("iPhone");
                    break;
                case MOBILE_ANDROID:
                    name.append("Android");
                    break;
                case TABLET:
                    name.append("Tablet");
                    break;
                case DESKTOP_APP:
                    name.append("Desktop App");
                    break;
                default:
                    name.append("Unknown Device");
            }
        }

        return name.toString();
    }
}
