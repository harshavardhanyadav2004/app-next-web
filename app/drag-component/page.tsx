"use client"
import React, { ChangeEvent, DragEvent, JSX, MouseEvent, ReactNode, useRef, useState } from "react"
import { ArrowRight, Code, Database, Layout, Layers, Smartphone, Users, Zap } from "lucide-react"
import { motion, useInView } from "framer-motion"
interface AnimatedCardProps {children: ReactNode;index: number}
interface Position { x: number ; y: number }
interface Size { width: number;height: number}
interface PhoneElement {id: number; type: "text" | "input" | "button" | "image"
  label: string;content?: string;placeholder?: string;position: Position;size: Size;
  style?: { fontSize?: string
    fontWeight?: string
    textAlign?: "left" | "right" | "center" | "justify" | "start" | "end"
  }
}
export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col text-white">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">How App Craft Works</h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our intuitive drag-and-drop interface makes app development simple and accessible to everyone.
                </p>
              </div></div>  <DragDropDemo />
          </div> </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Our Core Values</h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  The principles that guide everything we do at AppCraft.
                </p> </div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <AnimatedCard key={index} index={index}>
                  <div className="flex flex-col bg-background items-center space-y-4 rounded-lg border border-gray-800 p-6 h-full">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold">{value.title}</h3>
                    <p className="text-center text-gray-400 flex-grow">{value.description}</p>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
function AnimatedCard({ children, index }: AnimatedCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  }
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      {children}
    </motion.div>
  )
}
function DragDropDemo() {
  const [isDragging, setIsDragging] = useState(false)
  const [phoneElements, setPhoneElements] = useState<PhoneElement[]>([])
  const [activeElement, setActiveElement] = useState<number | null>(null)
  const [resizing, setResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, corner: "" })
  const [ , setDragOffset] = useState({ x: 0, y: 0 })
  const phoneRef = useRef<HTMLDivElement>(null)
  const loadSampleForm = () => {
    setPhoneElements([
      {
        id: 1, type: "text", label: "Text",  content: "Contact Form",
        position: { x: 100, y: 50 }, size: { width: 180, height: 40 }, style: { fontSize: "18px", fontWeight: "bold", textAlign: "center" }, },
      { id: 2,type: "text", label: "Text",content: "Please fill out the form below",
        position: { x: 100, y: 90 }, size: { width: 200, height: 20 }, style: { fontSize: "14px", textAlign: "center" },
      },
      { id: 3, type: "input",label: "Input", placeholder: "Full Name", position: { x: 70, y: 140 }, size: { width: 200, height: 40 },
      },
      {id: 4,   type: "input", label: "Input", placeholder: "Email Address", position: { x: 70, y: 200 }, size: { width: 200, height: 40 },
      },
      {
        id: 5, type: "input",label: "Input", placeholder: "Message", position: { x: 70, y: 260 },  size: { width: 200, height: 80 },
      },
      {
        id: 6,  type: "button", label: "Button", content: "Submit",  position: { x: 120, y: 360 },  size: { width: 100, height: 40 },
      },
    ])
  }
  const clearElements = () => {
    setPhoneElements([])
    setActiveElement(null)
  }
  const handleDragStart = (e: DragEvent<HTMLDivElement>, item: { type: string; label: string; icon: JSX.Element }) => {
    const sanitizedItem = {
      id: Date.now(), name: item.label,type: item.type,
    }
    e.dataTransfer.setData("text/plain", JSON.stringify({ type: "new", item: sanitizedItem }))
    setIsDragging(true)
  }
  const handleDragEnd = () => {
    setIsDragging(false)
  }
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!phoneRef.current) return
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"))
      const phoneRect = phoneRef.current.getBoundingClientRect()
      const x = e.clientX - phoneRect.left
      const y = e.clientY - phoneRect.top
      if (data.type === "new") {
        const item = data.item
        let size = { width: 100, height: 40 }
        if (item.type === "text") {
          size = { width: 150, height: 30 }
        } else if (item.type === "image") {
          size = { width: 100, height: 100 }
        } else if (item.type === "input") {
          size = { width: 200, height: 40 }
        }
        const newElement = {
          ...item,
          id: Date.now(),
          position: { x, y },
          size,
          content: item.type === "text" ? "Text element" : item.label,
          placeholder: item.type === "input" ? "Enter text here" : "",
        }
        setPhoneElements((prev) => [...prev, newElement])
        setActiveElement(newElement.id)
      } else if (data.type === "move") {
        const { id, offsetX, offsetY } = data
        setPhoneElements((prev) =>
          prev.map((el) =>
            el.id === parseInt(id)
              ? { ...el, position: { x: x - offsetX, y: y - offsetY } }
              : el) )  }
    } catch (error) {
      console.error("Error handling drop:", error)
    }
  }
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }
  const handleElementClick = (e: MouseEvent<HTMLDivElement>, elementId: number) => {
    e.stopPropagation()
    setActiveElement(elementId)
  }
  const handlePhoneClick = () => {  setActiveElement(null)}
  const handleElementDragStart = (e: DragEvent<HTMLDivElement>, element: PhoneElement) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    setDragOffset({ x: offsetX, y: offsetY })
    setActiveElement(element.id)
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "move",   id: element.id, offsetX, offsetY,})
    )
  }
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>, element: PhoneElement) => {
    e.stopPropagation()
    if (e.button !== 0) return
    setActiveElement(element.id)
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    setDragOffset({ x: offsetX, y: offsetY })
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!phoneRef.current) return
      const phoneRect = phoneRef.current.getBoundingClientRect()
      const x = moveEvent.clientX - phoneRect.left - offsetX
      const y = moveEvent.clientY - phoneRect.top - offsetY
      setPhoneElements((prev) =>
        prev.map((el) => (el.id === element.id ? { ...el, position: { x, y } } : el))
      )
    }
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove as unknown as EventListener)
      document.removeEventListener("mouseup", handleMouseUp)
    }
    document.addEventListener("mousemove", handleMouseMove as unknown as EventListener)
    document.addEventListener("mouseup", handleMouseUp)
  }
  const handleResizeStart = (e: MouseEvent<HTMLDivElement>, element: PhoneElement, corner: string) => {
    e.stopPropagation()
    e.preventDefault()
    setResizing(true)
    setActiveElement(element.id)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.size.width,
      height: element.size.height,
      corner,
    })
    const handleResizeMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - resizeStart.x
      const deltaY = moveEvent.clientY - resizeStart.y
      let newWidth = resizeStart.width
      let newHeight = resizeStart.height
      let newX = element.position.x
      let newY = element.position.y
      switch (corner) {
        case "br":
          newWidth = Math.max(50, resizeStart.width + deltaX)
          newHeight = Math.max(30, resizeStart.height + deltaY)
          break
        case "bl":
          newWidth = Math.max(50, resizeStart.width - deltaX)
          newX = element.position.x + (resizeStart.width - newWidth)
          newHeight = Math.max(30, resizeStart.height + deltaY)
          break
        case "tr":
          newWidth = Math.max(50, resizeStart.width + deltaX)
          newHeight = Math.max(30, resizeStart.height - deltaY)
          newY = element.position.y + (resizeStart.height - newHeight)
          break
        case "tl":
          newWidth = Math.max(50, resizeStart.width - deltaX)
          newHeight = Math.max(30, resizeStart.height - deltaY)
          newX = element.position.x + (resizeStart.width - newWidth)
          newY = element.position.y + (resizeStart.height - newHeight)
          break
      }
      setPhoneElements((prev) =>
        prev.map((el) => {
          if (el.id !== element.id) return el
          return {
            ...el,
            position: { x: newX, y: newY },
            size: { width: newWidth, height: newHeight },
          }
        })
      )
    }
    const handleResizeEnd = () => {
      setResizing(false)
      document.removeEventListener("mousemove", handleResizeMove as unknown as EventListener)
      document.removeEventListener("mouseup", handleResizeEnd)
    }
    document.addEventListener("mousemove", handleResizeMove as unknown as EventListener)
    document.addEventListener("mouseup", handleResizeEnd)
  }
  const handleContentChange = (e: ChangeEvent<HTMLInputElement>, elementId: number) => {
    const value = e.target.value
    setPhoneElements((prev) =>
      prev.map((el) => (el.id === elementId ? { ...el, content: value } : el))
    )
  }
  const handlePlaceholderChange = (e: ChangeEvent<HTMLInputElement>, elementId: number) => {
    const value = e.target.value
    setPhoneElements((prev) =>
      prev.map((el) => (el.id === elementId ? { ...el, placeholder: value } : el))
    )
  }
  const componentItems = [
    { type: "button", label: "Button", icon: <Layers className="h-5 w-5" /> },
    { type: "text", label: "Text", icon: <Code className="h-5 w-5" /> },
    { type: "image", label: "Image", icon: <Layout className="h-5 w-5" /> },
    { type: "input", label: "Input", icon: <Database className="h-5 w-5" /> },
  ]
  return (
    <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
      <div className="flex flex-col space-y-4">
        <h3 className="text-2xl font-bold text-center">Components</h3>
        <p className="text-gray-400 mb-4 text-center">Drag these components to the phone preview</p>
        <div className="grid grid-cols-2 gap-4">
          {componentItems.map((item, index) => (
            <div
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnd={handleDragEnd}
          >
            <motion.div
              className="flex items-center space-x-2 p-4 bg-gray-900 rounded-lg border border-gray-800 cursor-grab"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                {item.icon}
              </div>
              <span>{item.label}</span>
            </motion.div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 justify-center">
          <Button onClick={loadSampleForm} className="mt-4" size="lg">
            Load Sample Form
          </Button>
          <Button onClick={clearElements} className="mt-4" size="lg">
            Clear All
          </Button>
        </div>
        {activeElement && (
          <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-xl font-bold mb-4 text-center">Properties</h3>
            {(() => {
              const element = phoneElements.find((el) => el.id === activeElement)
              if (!element) return null
              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-gray-500">X: {Math.round(element.position.x)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Y: {Math.round(element.position.y)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Size</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-gray-500">Width: {Math.round(element.size.width)}px</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Height: {Math.round(element.size.height)}px</span>
                      </div>
                    </div>
                  </div>
                  {(element.type === "button" || element.type === "text") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Content</label>
                      <input
                        type="text"
                        value={element.content || ""}
                        onChange={(e) => handleContentChange(e, element.id)}
                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700"
                      />
                    </div>
                  )}
                  {element.type === "input" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Placeholder</label>
                      <input
                        type="text"
                        value={element.placeholder || ""}
                        onChange={(e) => handlePlaceholderChange(e, element.id)}
                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700"
                      />
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}
        <div className="mt-4 mu-5">
          <h3 className="text-xl font-bold mb-4 text-center">Try now by dragging the components!</h3>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <h3 className="text-2xl font-bold mb-6">Phone Preview</h3>
        <div
          ref={phoneRef}
          className="relative w-[280px] h-[560px] bg-gray-900 rounded-[36px] border-8 border-gray-800 overflow-hidden"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handlePhoneClick}
        >
          <div className="absolute top-0 w-full h-6 bg-black flex justify-center items-end">
            <div className="w-24 h-4 bg-black rounded-b-xl"></div>
          </div>
          {isDragging && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-500/10 pointer-events-none z-10"></div>
          )}
          {phoneElements.map((element) => (
            <div
              key={element.id}
              className={`absolute ${activeElement === element.id ? "ring-2 ring-blue-500" : ""} cursor-move`}
              style={{
                left: element.position.x,
                top: element.position.y,
                width: element.size.width,
                height: element.size.height,
              }}
              onClick={(e) => handleElementClick(e, element.id)}
              onMouseDown={(e) => handleMouseDown(e, element)}
              draggable
              onDragStart={(e) => handleElementDragStart(e, element)}
            >
              {element.type === "button" && (
                <button
                  className="w-full h-full px-4 py-2 bg-blue-600 text-white rounded-md"
                  style={{ fontSize: element.style?.fontSize }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {element.content || "Button"}
                </button>
              )}
              {element.type === "text" && (
                <div
                  className="w-full h-full flex items-center justify-center text-white"
                  style={{
                    fontSize: element.style?.fontSize,
                    fontWeight: element.style?.fontWeight,
                    textAlign: element.style?.textAlign || "left",
                  }}
                >
                  {element.content || "Text"}
                </div>
              )}
              {element.type === "image" && (
                <div className="w-full h-full bg-gray-800 rounded-md flex items-center justify-center">
                  <Layout className="h-8 w-8 text-gray-400" />
                </div>
              )}
              {element.type === "input" && (
                <input
                  type="text"
                  className="w-full h-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700"
                  placeholder={element.placeholder || "Input field"}
                  readOnly
                  onMouseDown={(e) => e.stopPropagation()}
                />
              )}
              {activeElement === element.id && !resizing && (
                <>
                  <div
                    className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize z-20"
                    onMouseDown={(e) => handleResizeStart(e, element, "br")}
                  ></div>
                  <div
                    className="absolute bottom-0 left-0 w-4 h-4 bg-blue-500 rounded-full cursor-sw-resize z-20"
                    onMouseDown={(e) => handleResizeStart(e, element, "bl")}
                  ></div>
                  <div
                    className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-ne-resize z-20"
                    onMouseDown={(e) => handleResizeStart(e, element, "tr")}
                  ></div>
                  <div
                    className="absolute top-0 left-0 w-4 h-4 bg-blue-500 rounded-full cursor-nw-resize z-20"
                    onMouseDown={(e) => handleResizeStart(e, element, "tl")}
                  ></div>
                </>
              )}
            </div>
          ))}
          {phoneElements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-center p-6">
              <p>Drag components here to build your app interface</p>
            </div>
          )}
        </div>
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">This interactive demo shows how easy it is to build apps with AppCraft</p>
          <Button className="mt-4" size="lg">
            Try the Full Experience
            <ArrowRight className="ml-2 h-4 w-4" /> </Button>  </div> </div> </div> )}
const values = [
  { title: "Accessibility",
    description: "We believe everyone should be able to build mobile apps, regardless of technical background or coding knowledge.", icon: <Users className="h-6 w-6" />,
  },
  {
    title: "Innovation", description: "We're constantly pushing the boundaries of what's possible with no-code development tools.",
    icon: <Zap className="h-6 w-6" />,
  },
  { title: "Quality",
    description: "We're committed to helping you build professional, high-quality apps that stand out in the marketplace.", icon: <Smartphone className="h-6 w-6" />,
  },
  { title: "Simplicity", description: "Complex doesn't have to mean complicated. We make the complex simple without sacrificing power.", icon: <Layers className="h-6 w-6" />,
  },
  {
    title: "Community",description: "We foster a supportive community of creators who share knowledge and inspire each other.",icon: <Users className="h-6 w-6" />,
  },
  { title: "Empowerment", description: "We empower individuals and businesses to bring their app ideas to life without technical limitations.", icon: <Code className="h-6 w-6" />,
  },
]
interface ButtonProps {
  children: ReactNode ;className?: string ;onClick?: () => void;size?: "lg" | "md" | "sm"
}
function Button({ children, className = "", onClick, size = "md" }: ButtonProps) {
  const sizeClasses = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2",  lg: "px-6 py-3"}
  return (
    <button
      className={`inline-flex items-center justify-center rounded-sm bg-white font-medium text-black  hover:bg-gray-300 hover:shadow-md transition duration-200 ease-in-out ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    > {children} </button>)}