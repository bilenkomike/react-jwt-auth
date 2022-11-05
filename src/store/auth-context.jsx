import React, {createContext, useState, useEffect, useCallback} from 'react';

let logoutTimer;


const AuthContext = createContext({
    token: '',
    isLoggedin: false,
    login : (token) => {},
    logout: () => {}
})


const calculateRemainingTime  = expirationTime => {
const currentTime = new Date().getTime();
const addjustedExpirationTime = new Date(expirationTime).getTime();

const remainingDuration = addjustedExpirationTime - currentTime;
return remainingDuration;
};


const retriveStoredToken = () => {
    const storedToken = localStorage.getItem('token');
    const storedExpirationDate = localStorage.getItem('expirationTime');
    const remainingTime = calculateRemainingTime(storedExpirationDate);

    if(remainingTime <= 3600) {
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');
        return null;
    }
    return {
        token: storedToken,
        duration: remainingTime
    };
};

export const AuthContextProvider = props => {
    const tokenData = retriveStoredToken();
    let initialToken;
    if(tokenData) initialToken = tokenData.token;
    const [token, setToken] = useState(initialToken);

    


    

    const logoutHandler = useCallback(() => {
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');
        

        if(logoutTimer) {
            clearTimeout(logoutTimer);
        }
    }, []);

    const loginHandler = (token, expirationTime) => {
        localStorage.setItem('token', token);
        localStorage.setItem('expirationTime', expirationTime);
        setToken(token);
        
        const remainingTime = calculateRemainingTime(expirationTime);
        logoutTimer = setTimeout(logoutHandler,remainingTime);
    }


    const userIsLoggedIn = !!token;
    
    useEffect(() => {
        if(tokenData) {
            logoutTimer = setTimeout(logoutHandler,tokenData.duration);
        }
    }, [tokenData,logoutHandler]);

    const contextValue = {
        token: token,
        isLoggedIn: userIsLoggedIn,
        login: loginHandler,
        logout: logoutHandler
    }

    return <AuthContext.Provider value={contextValue}>
        {props.children}
    </AuthContext.Provider>
};


export default AuthContext;