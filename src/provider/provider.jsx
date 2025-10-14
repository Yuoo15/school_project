import { createContext, useState } from "react";

const Context = createContext(null);

export const Provider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  const login = (newUser, cb) => {
    setIsAuth(newUser);
    cb();
  };

  const logout = (cb) => {
    setIsAuth(null);
    cb();
  };

  return (
    <Context.Provider value={{ logout, login, isAuth }}>
      {children}
    </Context.Provider>
  );
};

export default Context;
