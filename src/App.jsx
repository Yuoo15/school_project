import React from 'react'
import { Routes, Route, Link, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import Home from './pages/Home/home'
import Classes from './pages/classes/classes'
import Teachers from './pages/teachers/teachers'
import Subjects from './pages/subjects/subjects'
import Schedule from './pages/shedule/shedule'
import Settings from './pages/settings/settings'
import Layout from './pages/Layout/Layout'
import About from './pages/about/about'


export default function App() {
    const router = createBrowserRouter(createRoutesFromElements(
        <Route path='/' element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="classes" element={<Classes />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />}/>
        </Route>
    ),{basename:'/school-project-gpt-'})
return (
<div className="app">
    <RouterProvider router={router}/>
</div>
)
}