"use client"

export default function Footer() {
    return <footer className=" grid md:grid-cols-3 w-full  border-t border-secondary/30 bg-secondary/20">
        <div className="md:col-start-2 col-span-1   items-center justify-end flex flex-col pt-10 pb-4">
            {/* <div className="py-4"><ThemeModeToggle/> </div> */}
            <div>Made by Taas S. Ekpaye</div>
            <div>Made with Next.JS</div>
        </div>
    </footer>
}