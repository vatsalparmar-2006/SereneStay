// import { useState } from 'react'
// import viteLogo from '/vite.svg'
// import Home from './pages/public/Home'
// import AppRoutes from "./routes/AppRoutes";

// function App() {
//   return (
//     <>
//       <Home />
//     </>
//   )
// }

// export default App

import { ConfigProvider } from "antd";
import AppRoutes from "./routes/AppRoutes";

const App = () => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: "#00b4d8",
        colorBgBase: "#ffffff",
        borderRadius: 12,
        fontFamily: "'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      },
      components: {
        Button: {
          colorPrimary: "#00b4d8",
          algorithm: true,
        },
      },
    }}
  >
    <AppRoutes />
  </ConfigProvider>
);

export default App;
