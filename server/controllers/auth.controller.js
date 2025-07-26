import UserContext from '../models/context.model.js';
import UserPreference from '../models/preference.model.js';
import SuspiciousLogin from '../models/suspiciousLogin.model.js';
import saveLogInfo from '../middlewares/logger/logInfo.js';

import getCurrentContextData from '../utils/contextData.js';

import formatCreatedAt from '../utils/timeConvertor.js';

const types = {
    NO_CONTEXT_DATA: "no_context_data",
    MATCH: "match",
    BLOCKED: "blocked",
    SUSPICIOUS: "suspicious",
    ERROR: "error",
};

const isTrustedDevice = (currentContextData, userContextData) => {
    Object.keys(userContextData).every((key) => userContextData[key] === currentContextData[key]);
}

const isSuspiciousContextChanged = (oldContextData, newContextData) =>
    Object.keys(oldContextData).some(
        (key) => oldContextData[key] !== newContextData[key]
    );

const isOldDataMatched = (oldSuspiciousContextData, userContextData) =>
    Object.keys(oldSuspiciousContextData).every(
        (key) => oldSuspiciousContextData[key] === userContextData[key]
    );

const getOldSuspiciousContextData = (_id, currentContextData) =>
    SuspiciousLogin.findOne({
        user: _id,
        ip: currentContextData.ip,
        country: currentContextData.country,
        city: currentContextData.city,
        browser: currentContextData.browser,
        platform: currentContextData.platform,
        os: currentContextData.os,
        device: currentContextData.device,
        deviceType: currentContextData.deviceType,
    });

const addNewSuspiciousLogin = async (_id, existingUser, currentContextData) => {
    const newSuspiciousLogin = new SuspiciousLogin({
        user: _id,
        email: existingUser.email,
        ip: currentContextData.ip,
        country: currentContextData.country,
        city: currentContextData.city,
        browser: currentContextData.browser,
        platform: currentContextData.platform,
        os: currentContextData.os,
        device: currentContextData.device,
        deviceType: currentContextData.deviceType,
    });

    return await newSuspiciousLogin.save();
};


const verifyContextData = async (req, existingUser) => {
    try {
        const { _id } = existingUser;
        const userContextData = await UserContext.findOne({ user: _id });

        if (!userContextData) {
            return types.NO_CONTEXT_DATA;
        };

        const userContextDataObj = userContextData.toObject();
        const currentContextData = getCurrentContextData(req);

        if (isTrustedDevice(currentContextData, userContextDataObj)) {
            return types.MATCH;
        }

        const oldSuspiciousContextData = await getOldSuspiciousContextData(_id, currentContextData);
        if (oldSuspiciousContextData) {
            if (oldSuspiciousContextData.isBlocked) return types.BLOCKED;
            if (oldSuspiciousContextData.isTrusted) return types.MATCH;
        }

        let newSuspiciousData = [];
        if (oldSuspiciousContextData && isSuspiciousContextChanged(oldSuspiciousContextData, currentContextData)) {
            const {
                ip: suspiciousIp,
                country: suspiciousCountry,
                city: suspiciousCity,
                browser: suspiciousBrowser,
                platform: suspiciousPlatform,
                os: suspiciousOs,
                device: suspiciousDevice,
                deviceType: suspiciousDeviceType,
            } = oldSuspiciousContextData;

            if (
                suspiciousIp !== currentContextData.ip ||
                suspiciousCountry !== currentContextData.country ||
                suspiciousCity !== currentContextData.city ||
                suspiciousBrowser !== currentContextData.browser ||
                suspiciousDevice !== currentContextData.device ||
                suspiciousDeviceType !== currentContextData.deviceType ||
                suspiciousPlatform !== currentContextData.platform ||
                suspiciousOs !== currentContextData.os

            ) {
                //Suspicoius login data found , bit it doesn't match the current context data, so we add new suspicious login data

                const res = await addNewSuspiciousLogin(_id, existingUser, currentContextData);
                newSuspiciousData = {
                    time: formatCreatedAt(res.createdAt),
                    ip: res.ip,
                    country: res.country,
                    city: res.city,
                    browser: res.browser,
                    platform: res.platform,
                    os: res.os,
                    device: res.device,
                    deviceType: res.deviceType,
                };

            } else {
                // increase the unverifiedAttempts count by 1
                await SuspiciousLogin.findByIdAndUpdate(
                    oldSuspiciousContextData._id,
                    {
                        $inc: { unverifiedAttempts: 1 },
                    },
                    { new: true }
                );

                //if the unverfiedAttempts coutn is greater than or equal to 3, then we block the user

                if (oldSuspiciousContextData.unverifiedAttempts >= 3) {
                    await SuspiciousLogin.findByIdAndUpdate(
                        oldSuspiciousContextData._id, {
                        isBlocked: true,
                        isTrusted: false,
                    },
                        { new: true }
                    )
                }

                await saveLogInfo(
                    req,
                    "Device blocked due to too many unverified login attempts",
                    "sign in",
                    "warn"
                );

                return types.BLOCKED;

            }

            return types.SUSPICIOUS;

        }
        else if (oldSuspiciousContextData && isOldDataMatched(oldSuspiciousContextData, currentContextData)) {
            return types.MATCH;
        }
        else {
            //No previous suspicious login data found, so we create a new one

            const res = await addNewSuspiciousLogin(
                _id,
                existingUser,
                currentContextData
            )
            newSuspiciousData = {
                time: formatCreatedAt(res.createdAt),
                id: res._id,
                ip: res.ip,
                country: res.country,
                city: res.city,
                browser: res.browser,
                platform: res.platform,
                os: res.os,
                device: res.device,
                deviceType: res.deviceType,
            };

        }

        const mismatchedProps = [];
        if (userContextData.ip !== newSuspiciousData.ip) {
            mismatchedProps.push("ip");
        }
        if (userContextData.browser !== newSuspiciousData.browser) {
            mismatchedProps.push("browser");
        }
        if (userContextData.device !== newSuspiciousData.device) {
            mismatchedProps.push("device");
        }
        if (userContextData.deviceType !== newSuspiciousData.deviceType) {
            mismatchedProps.push("deviceType");
        }
        if (userContextData.country !== newSuspiciousData.country) {
            mismatchedProps.push("country");
        }
        if (userContextData.city !== newSuspiciousData.city) {
            mismatchedProps.push("city");
        }

        if (mismatchedProps.length > 0) {
            return {
                mismatchedProps: mismatchedProps,
                currentContextData: newSuspiciousData,

            }
        }
        return types.MATCH;




    } catch (error) {
        console.log("Erorr in verifyContextData");
        return types.ERROR;
    }
}


const addContextData = async (req, res) => {
    const {
        ip,
        location,
        country,
        city,
        browser,
        os,
        platform,
        deviceType
    } = getCurrentContextData(req);
    const { email, userId } = req;

    const newContextData = new UserContext({
        user: userId,
        email,
        ip,
        location,
        country,
        city,
        browser,
        os,
        platform,
        deviceType

    })

    try {
        await newContextData.save();
        res.status(200).json({
            message: "Email verification process was successful",
        });


    } catch (error) {
        console.log("Error in adding contextData: ", error.message);
        res.status(500).json({
            message: "Internal server error",
        });
    }

}

const getAuthContextData = async (req, res) => {
    try {
        const result = await UserContext.findOne({ user: req.userId });
        if (!result) {
            return res.status(404).json({ message: "Not found" });
        }

        const userContextData = {
            firstAdded: formatCreatedAt(result.createdAt),
            ip: result.ip,
            country: result.country,
            city: result.city,
            browser: result.browser,
            platform: result.platform,
            os: result.os,
            device: result.device,
            deviceType: result.deviceType,
        };

        return res.status(200).json(userContextData);
    } catch (error) {
        console.log("Error in getAuthContextData: ", error.message);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}


const getTrustedAuthContextData = async (req, res) => {
    try {
        const result = await SuspiciousLogin.find({
            user: req.userId,
            isTrusted: true,
            isBlocked: false,
        })
        const trustedAuthContextData = result.map((item) => {
            return {
                _id: item._id,
                time: formatCreatedAt(item.createdAt),
                ip: item.ip,
                country: item.country,
                city: item.city,
                browser: item.browser,
                platform: item.platform,
                os: item.os,
                device: item.device,
                deviceType: item.deviceType,
            };
        });
        return res.status(200).json(trustedAuthContextData);
    }catch(error){
        console.log("Error in getTrustedAuthContextData", error.message);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

const getBlockedAuthContextData = async (req, res) => {
    try {
        const result = await SuspiciousLogin.find({
            user: req.userId,
            isTrusted: false,
            isBlocked: true,
        })
        const blockedAuthContextData = result.map((item) => {
            return {
                _id: item._id,
                time: formatCreatedAt(item.createdAt),
                ip: item.ip,
                country: item.country,
                city: item.city,
                browser: item.browser,
                platform: item.platform,
                os: item.os,
                device: item.device,
                deviceType: item.deviceType,
            };
        });
        return res.status(200).json(blockedAuthContextData);
    }catch(error){
        console.log("Error in blockedAuthContextData", error.message);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

const getUserPreferences = async(req, res)=>{
    try{
        const userPreferences = await UserPreference.findOne({user: req.userId});
        if(!userPreferences){
            return res.status(404).json({message:"Not found"});
        }
        res.status(200).json(userPreferences);
    }catch(error){
        console.log("Error in getUserPreferences", error.message);
        return res.status(500).json({message:"Internal server error"});
    }
}

const deleteContextAuthData = async (req, res) => {
  try {
    const contextId = req.params.contextId;

    await SuspiciousLogin.deleteOne({ _id: contextId });

    res.status(200).json({
      message: "Data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


const blockContextAuthData = async(req, res)=>{
     try{
        const contextId = req.params.contextId;
        await SuspiciousLogin.findOneAndUpdate(
            {_id: contextId},
            {$set:{isBlocked: true, isTrusted: false}},
            {new: true}
        );

        return res.status(200).json({message: "Blocked successfully"});
     }catch(error){
        console.log("Error in blockContextAuthData", error.message);
        return res.status(500).json({message:"Internal server error"});


     }
}

const unblockContextAuthData = async(req, res)=>{
     try{
        const contextId = req.params.contextId;
        await SuspiciousLogin.findOneAndUpdate(
            {_id: contextId},
            {$set:{isBlocked: false, isTrusted: true}},
            {new: true}
        );

        return res.status(200).json({message: "Unblocked successfully"});
     }catch(error){
        console.log("Error in unblockContextAuthData", error.message);
        return res.status(500).json({message:"Internal server error"});


     }
}

export {
  verifyContextData,
  addContextData,
  getAuthContextData,
  getUserPreferences,
  getTrustedAuthContextData,
  getBlockedAuthContextData,
  deleteContextAuthData,
  blockContextAuthData,
  unblockContextAuthData,
  types,

}


