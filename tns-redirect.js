// Device detection follows the original TNS MeridianFix launcher.
// MeridianFix web assets are hosted in this repository, so A8/A10 devices
// are routed to the local build instead of LukeZGD's hosted copy.
canvas = document.createElement('canvas');
gl = canvas.getContext('experimental-webgl');
debugInfo = gl == null ? null : gl.getExtension('WEBGL_debug_renderer_info');
glRenderer = debugInfo == null ? 'unknown' : gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
userAgent = window.navigator.userAgent;
window.onload = function() {
    if (glRenderer.includes("A10") || glRenderer.includes("A8")) {
        if (userAgent.includes("10_3_2") || userAgent.includes("10_3_3")) {
            window.location.replace('./substrate/');
        } else {
            window.location.replace('./substitute/');
        }
    } else if (userAgent.includes("like Mac OS X")) {
        if (glRenderer.includes("A9")) {
            window.location.replace('https://lukezgd.github.io/tns-sockport/v0rtex');
        } else if (glRenderer.includes("PowerVR")) {
            window.location.replace('https://ios.cfw.guide/installing-socket/');
        } else if (userAgent.includes("10_")) {
            window.location.replace('https://lukezgd.github.io/tns-sockport');
        }
    }
};
