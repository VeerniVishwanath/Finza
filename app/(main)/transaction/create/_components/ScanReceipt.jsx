import { Button } from "@/components/ui/button";
import { CameraIcon, LoaderCircleIcon } from "lucide-react";
import { useRef } from "react";

export default function ScanReceipt({ scanReceiptLoading, handleScanReceipt }) {
  const inputRef = useRef();

  return (
    <Button
      onClick={() => inputRef.current.click()}
      className="w-full h-10 bg-gradient-to-br from-amber-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity "
    >
      {scanReceiptLoading ? (
        <>
          <LoaderCircleIcon className="mr-2 animate-spin" />
          <span> Scanning Receipt...</span>
        </>
      ) : (
        <>
          <input
            className="hidden"
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleScanReceipt(e.target.files[0])}
          />
          <CameraIcon className="mr-2" /> <span>Scan Receipt with AI</span>
        </>
      )}
    </Button>
  );
}
