// COMPONENT :: DROPZONE
"use client";

// COMPONENTS :: IMPORTS 
import { FiUploadCloud } from "react-icons/fi";
import { LuFileSymlink } from "react-icons/lu";
import { MdClose } from "react-icons/md";
import ReactDropzone from "react-dropzone";
import bytesToSize from "@/utils/bytes-to-size";
import fileToIcon from "@/utils/file-to-icon";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import compressFileName from "@/utils/compress-file-name";
import { Skeleton } from "@/components/ui/skeleton";
import convertFile from "@/utils/convert";
import { ImSpinner3 } from "react-icons/im";
import { MdDone } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { HiOutlineDownload } from "react-icons/hi";
import { BiError } from "react-icons/bi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import loadFfmpeg from "@/utils/load-ffmpeg";
import type { Action } from "@/types";
import { FFmpeg } from "@ffmpeg/ffmpeg";

const extensions = {
  image: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "webp",
    "ico",
    "tif",
    "tiff",
    "svg",
    "raw",
    "tga",
  ],
  video: [
    "mp4",
    "m4v",
    "mp4v",
    "3gp",
    "3g2",
    "avi",
    "mov",
    "wmv",
    "mkv",
    "flv",
    "ogv",
    "webm",
    "h264",
    "264",
    "hevc",
    "265",
  ],
  audio: ["mp3", "wav", "ogg", "aac", "wma", "flac", "m4a"],
  text: ["txt", "md", "pdf"],
  notebook: ["ipynb"],
};

export default function Dropzone() {
  // VARIABLES AND HOOKS 
  const { toast } = useToast();
  const [is_hover, setIsHover] = useState<boolean>(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [is_ready, setIsReady] = useState<boolean>(false);
  const [files, setFiles] = useState<Array<any>>([]);
  const [is_loaded, setIsLoaded] = useState<boolean>(false);
  const [is_converting, setIsConverting] = useState<boolean>(false);
  const [is_done, setIsDone] = useState<boolean>(false);
  const ffmpegRef = useRef<any>(null);
  const [defaultValues, setDefaultValues] = useState<string>("video");
  const [selcted, setSelected] = useState<string>("...");
  const accepted_files = {
    "image/*": [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".ico",
      ".tif",
      ".tiff",
      ".raw",
      ".tga",
    ],
    "audio/*": [],
    "video/*": [],
    "text/*": [".txt", ".md", ".pdf"],
    "application/x-ipynb+json": [".ipynb"],
  };

  // FUNCTIONS
  const reset = () => {
    setIsDone(false);
    setActions([]);
    setFiles([]);
    setIsReady(false);
    setIsConverting(false);
  };
  const downloadAll = (): void => {
    for (let action of actions) {
      !action.is_error && download(action);
    }
  };
  const download = (action: Action) => {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = action.url;
    a.download = action.output;

    document.body.appendChild(a);
    a.click();

    // POST CONVERSION CLEAN UP
    URL.revokeObjectURL(action.url);
    document.body.removeChild(a);
  };
  const convert = async (): Promise<any> => {
    let tmp_actions = actions.map((elt) => ({
      ...elt,
      is_converting: true,
    }));
    setActions(tmp_actions);
    setIsConverting(true);
    for (let action of tmp_actions) {
      try {
        const { url, output } = await convertFile(ffmpegRef.current, action);
        tmp_actions = tmp_actions.map((elt) =>
          elt === action
            ? {
                ...elt,
                is_converted: true,
                is_converting: false,
                url,
                output,
              }
            : elt
        );
        setActions(tmp_actions);
      } catch (err) {
        tmp_actions = tmp_actions.map((elt) =>
          elt === action
            ? {
                ...elt,
                is_converted: false,
                is_converting: false,
                is_error: true,
              }
            : elt
        );
        setActions(tmp_actions);
      }
    }
    setIsDone(true);
    setIsConverting(false);
  };
  const handleUpload = (data: Array<any>): void => {
    handleExitHover();
    setFiles(data);
    const tmp: Action[] = [];
    data.forEach((file: any) => {
      const formData = new FormData();
      const fromExtension = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2);

      tmp.push({
        file_name: file.name,
        file_size: file.size,
        from: fromExtension,
        to: null,
        file_type: file.type,
        file,
        is_converted: false,
        is_converting: false,
        is_error: false,
      });
    });
    setActions(tmp);
  };
  const handleHover = (): void => setIsHover(true);
  const handleExitHover = (): void => setIsHover(false);
  const updateAction = (file_name: String, to: String) => {
    setActions(
      actions.map((action): Action => {
        if (action.file_name === file_name) {
          return {
            ...action,
            to,
          };
        }

        return action;
      })
    );
  };
  const checkIsReady = (): void => {
    let tmp_is_ready = true;
    actions.forEach((action: Action) => {
      if (!action.to) tmp_is_ready = false;
    });
    setIsReady(tmp_is_ready);
  };
  const deleteAction = (action: Action): void => {
    setActions(actions.filter((elt) => elt !== action));
    setFiles(files.filter((elt) => elt.name !== action.file_name));
  };
  useEffect(() => {
    if (!actions.length) {
      setIsDone(false);
      setFiles([]);
      setIsReady(false);
      setIsConverting(false);
    } else checkIsReady();
  }, [actions]);
  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    const ffmpeg_response: FFmpeg = await loadFfmpeg();
    ffmpegRef.current = ffmpeg_response;
    setIsLoaded(true);
  };

  // RETURNS
  if (actions.length) {
    return (
      <div className="space-y-6">
        {actions.map((action: Action, i: any) => (
          <div
            key={i}
            className="w-full py-4 space-y-2 lg:py-0 relative cursor-pointer rounded-xl border h-fit lg:h-20 px-4 lg:px-10 flex flex-wrap lg:flex-nowrap items-center justify-between"
          >
            {!is_loaded && (
              <Skeleton className="h-full w-full -ml-10 cursor-progress absolute rounded-xl" />
            )}
            <div className="flex gap-4 items-center">
              <span className="text-2xl text-purple-600">
                {fileToIcon(action.file_type)}
              </span>
              <div className="flex items-center gap-1 w-96">
                <span className="text-md font-medium overflow-x-hidden">
                  {compressFileName(action.file_name)}
                </span>
                <span className="text-muted-foreground text-sm">
                  ({bytesToSize(action.file_size)})
                </span>
              </div>
            </div>

            {action.is_error ? (
              <Badge variant="destructive" className="flex gap-2">
                <span> ERROR CONVERTING THE FILE </span>
                <BiError />
              </Badge>
            ) : action.is_converted ? (
              <Badge variant="default" className="flex gap-2 bg-green-500">
                <span> DONE </span>
                <MdDone />
              </Badge>
            ) : action.is_converting ? (
              <Badge variant="secondary" className="flex gap-2">
                <span> CONVERTING... </span>
                <ImSpinner3 />
              </Badge>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-md font-medium">CONVERT TO:</span>
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(v: any) => {
                      updateAction(action.file_name, v);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select format to convert" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* IMAGE */}
                      {action.file_type.includes("image") && (
                        <div className="grid grid-cols-2 gap-2 w-fit">
                          {extensions.image.map((elt, i) => (
                            <div key={i} className="col-span-1 text-center">
                              <SelectItem value={elt} className="mx-auto">
                                {elt}
                              </SelectItem>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* VIDEO */}
                      {action.file_type.includes("video") && (
                        <div className="grid grid-cols-2 gap-2 w-fit">
                          {extensions.video.map((elt, i) => (
                            <div key={i} className="col-span-1 text-center">
                              <SelectItem value={elt} className="mx-auto">
                                {elt}
                              </SelectItem>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* AUDIO */}
                      {action.file_type.includes("audio") && (
                        <div className="grid grid-cols-2 gap-2 w-fit">
                          {extensions.audio.map((elt, i) => (
                            <div key={i} className="col-span-1 text-center">
                              <SelectItem value={elt} className="mx-auto">
                                {elt}
                              </SelectItem>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* TEXT */}
                      {action.file_type.includes("text") && (
                        <div className="grid grid-cols-2 gap-2 w-fit">
                          {extensions.text.map((elt, i) => (
                            <div key={i} className="col-span-1 text-center">
                              <SelectItem value={elt} className="mx-auto">
                                {elt}
                              </SelectItem>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* IPYNB */}
                      {action.file_type.includes("application/x-ipynb+json") && (
                        <div className="grid grid-cols-1 gap-2 w-fit">
                          <SelectItem value="pdf" className="mx-auto">
                            PDF
                          </SelectItem>
                        </div>
                      )}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    className="text-lg text-muted-foreground"
                    onClick={() => deleteAction(action)}
                  >
                    <MdClose />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="flex items-center gap-4">
          <Button
            onClick={convert}
            disabled={!is_ready}
            variant={"secondary"}
            className="gap-2"
          >
            CONVERT FILES
            <FiUploadCloud />
          </Button>
          <Button
            disabled={!is_done}
            onClick={downloadAll}
            variant={"default"}
            className="gap-2"
          >
            DOWNLOAD ALL
            <HiOutlineDownload />
          </Button>
          <Button
            variant={"destructive"}
            className="gap-2"
            onClick={reset}
            disabled={is_converting}
          >
            RESET
            <LuFileSymlink />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ReactDropzone
      onDrop={handleUpload}
      accept={accepted_files}
      onDragEnter={handleHover}
      onDragLeave={handleExitHover}
    >
      {({ getRootProps, getInputProps }) => (
        <div
          {...getRootProps()}
          className={`cursor-pointer border border-dashed flex flex-col items-center gap-6 px-8 py-20 rounded-xl w-full transition-all ${
            is_hover ? "border-purple-600" : "border-slate-200"
          }`}
        >
          <input {...getInputProps()} />
          <span className="text-6xl text-purple-600">
            <FiUploadCloud />
          </span>
          <div className="space-y-2">
            <p className="text-2xl font-medium text-muted-foreground text-center">
              Drag and drop your files here
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Please only use files under 50MB
            </p>
          </div>
        </div>
      )}
    </ReactDropzone>
  );
}

