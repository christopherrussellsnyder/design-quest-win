import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { FeaturesVideo } from "./FeaturesVideo";
import { InterfaceVideo } from "./InterfaceVideo";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="main" component={MainVideo} durationInFrames={483} fps={30} width={1920} height={1080} />
    <Composition id="features" component={FeaturesVideo} durationInFrames={820} fps={30} width={1920} height={1080} />
    {/* Interface tour: 80+150+160+160+150+130+130 = 960 - (15+22+22+22+22+20)=123 overlap = 837 */}
    <Composition id="interface" component={InterfaceVideo} durationInFrames={837} fps={30} width={1920} height={1080} />
  </>
);
