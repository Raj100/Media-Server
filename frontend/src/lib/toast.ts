// src/lib/toast.ts
import { useToast, TYPE, POSITION } from "vue-toastification"
import "vue-toastification/dist/index.css"

export type ToastType = "success" | "error"

interface ToastOptions {
  message: string
  type?: ToastType
}

const toast = useToast() // <-- use the composable

export function showToast({ message, type = "success" }: ToastOptions) {
  toast(message, {
    type: type === "success" ? TYPE.SUCCESS : TYPE.ERROR,
    position: POSITION.TOP_RIGHT,
    timeout: 2500,
    closeOnClick: true,
    pauseOnHover: true,
    hideProgressBar: false,
    icon: true,
    toastClassName:
      type === "success"
        ? "bg-green-700 text-white shadow-lg rounded-lg"
        : "bg-red-700 text-white shadow-lg rounded-lg text-center",
    bodyClassName: "font-semibold",
  })
}
