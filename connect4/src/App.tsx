import Menu from "./components/Menu";
import Board from "./components/LocalGame";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OnlineBoard from "./components/OnlineGame";
import { RoomProvider } from "./context/RoomContext";
import { Toaster } from "react-hot-toast";
import OnlineMenu from "./components/OnlineMenu";
import CreateUserFrom from "./components/CreateUserForm";



function App() {
  return (
    <div className="w-full flex flex-col h-screen max-h-screen place-items-center place-content-center bg-neutral-600 ">
      <Router>
        <RoomProvider>
          <Routes>
            <Route path="/" element={<Menu />} />
            <Route
              path="/local"
              element={
                  <Board />
              }
            />
            <Route path="/online/:id" element={
                <OnlineBoard />
            } />
            <Route path="/online" element={
                <OnlineMenu />
            } />

            <Route path="/login" element={
                <CreateUserFrom />
            } />
          </Routes>
          <Toaster />
        </RoomProvider>
      </Router>
    </div>
  );
}

export default App;
