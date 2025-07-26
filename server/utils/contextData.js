import geoip from 'geoip-lite';

const getCurrentContextData = (req)=>{
    try{
    const ip =req.clientIp || req.ip ||"unknown";
    const location = geoip.lookup(ip) || "unknown";
    const country = location.country?location.country.toString() : "unknown";
    const city = location.city?location.city.toString() : "unknown";
    const browser  = req.useragent.browser?`${req.useragent.browser} ${req.useragent.version}` : "unknown";
    const os = req.useragent.os?req.useragent.os.toString() : "unknown";
    const platform = req.useragent.platform?req.useragent.platform.toString() : "unknown";
    const device = req.useragent.device?req.useragent.device.toString() : "unknown";

    const isMobile = req.useragent.isMobile || false;
    const isTablet = req.useragent.isTablet || false;
    const isDesktop = req.useragent.isDesktop || false;

    const deviceType = isMobile ? "mobile" : isTablet ? "tablet" : isDesktop ? "desktop" : "unknown";

    return {
        ip,
        location,
        country,
        city,
        browser,
        os,
        platform,
        device,
        deviceType
    };
}catch(err){
    console.error("Error getting context data:", err.message);
}
};

export default getCurrentContextData;