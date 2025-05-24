import { useState, useEffect } from "react"

export const Background = () => {
    const [isActive, setIsActive] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e) => {
            setIsActive(true)
            setPosition({
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            })
        
            clearTimeout(window.timeoutId)
            window.timeoutId = setTimeout(() => setIsActive(false), 1500)
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            clearTimeout(window.timeoutId)
        }
    }, [])

    const baseColor = "#D6FABD"
    const activeColor = "#AEEB82"

    const gradientStyle = {
    background: isActive
      ? `radial-gradient(circle at ${position.x * 100}% ${position.y * 100}%, ${activeColor}, ${baseColor})`
      : baseColor,
    transition: "background 0.5s ease",
    }

    return <div className="fixed inset-0 -z-10 min-h-screen w-full" style={gradientStyle} />
}
