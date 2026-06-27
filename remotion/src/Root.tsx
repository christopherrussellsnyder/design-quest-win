import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { FeaturesVideo } from "./FeaturesVideo";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={483}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Features tour: 75+170+160+150+130+130+120 = 935 - (15+20+20+20+20+20)=115 overlap = 820 */}
    <Composition
      id="features"
      component={FeaturesVideo}
      durationInFrames={820}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
