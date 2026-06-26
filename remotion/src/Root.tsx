import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 6 scenes, ~22s total at 30fps
// Scene durations (frames): 75 + 90 + 90 + 90 + 90 + 120 = 555
// Transitions (4 x 18 overlap) = -72 → 483 final
export const RemotionRoot: React.FC = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={483}
    fps={30}
    width={1920}
    height={1080}
  />
);
