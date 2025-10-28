import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import Layout from './pages/Layout/Layout';
import Home from './pages/Home/home';
import Classes from './pages/classes/classes';
import Teachers from './pages/teachers/teachers';
import Subjects from './pages/subjects/subjects';
import Schedule from './pages/shedule/shedule';
import Settings from './pages/settings/settings';
import About from './pages/about/about';
import Reg from './components/reg/reg';
import Login from './pages/login/login';
import KidHome from './pages/kid/homekid';
import TeacherSchedule from './pages/TeacherSchedule/TeacherSchedule';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<Reg><Layout /></Reg>}>
        <Route index element={<Home />} />
        <Route path="classes" element={<Classes />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="settings" element={<Settings />} />
        <Route path="about" element={<About />} />
      </Route>
      {/* Страница для учителей */}
      <Route path='/teacher-schedule' element={<Reg><TeacherSchedule /></Reg>} />
      {/* Страница для учеников */}
      <Route path='/kid' element={<Reg><KidHome /></Reg>} />
      <Route path="login" element={<Login />} />
    </>
  )
);

export default function App() {
  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
}