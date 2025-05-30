import { nextTick } from "process";

const testDataUriInImage = async (dataUri: string) => {
  return new Promise<boolean>((resolve) => {
    let img: HTMLImageElement | null = new Image();

    const removeListeners = () => {
      if (img) {
        document.body.removeChild(img);
        img.removeEventListener("load", loadListener);
        img.removeEventListener("error", errorListener);
        img = null;
      }
    };

    function loadListener(this: HTMLImageElement, ev: Event) {
      ev.preventDefault();
      removeListeners();
      nextTick(() => resolve(true));
    }

    function errorListener(this: HTMLImageElement, ev: Event) {
      ev.preventDefault();
      removeListeners();
      nextTick(() => resolve(false));
    }

    img.addEventListener("load", loadListener);
    img.addEventListener("error", errorListener);

    try {
      img.alt = "Test Image";
      img.src = dataUri;
      img.style.display = "none";
      img.style.position = "absolute";
      img.style.top = "-9999px";
      img.style.left = "-9999px";
    } catch (e) {
      console.error("Error setting image src:", e);
    }

    document.body.appendChild(img);
  });
};

export default testDataUriInImage;
