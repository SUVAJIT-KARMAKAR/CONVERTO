// PAGE :: IMPORTS 
import Dropzone from "@/components/dropzone";

export default function Home() {
    return (
        <div className="space-y-16 pb-8">
            {/* TITLE AND DESCRIPTION OF THE APPLICATION*/}
            <div className="space-y-6">
                <h1 className="text-3xl md:text-5xl font-medium text-center flex sm:flex-wrap">
                    CONVERT YOUR FILES IN JUST ONE CLICK 
                </h1>
                <p className="text-muted-foreground text-md md:text-lg text-center md:px-24 xl:px-44 2xl:px-52">
                Effortlessly transform your images, videos, and audio files. <br/> No software or plugins required. Just drag and drop your files. <br/> Let CONVERTO handle the rest.
                </p>
            </div>

            {/* UPLOAD BOX*/}
            <Dropzone />
        </div>
    );
}
