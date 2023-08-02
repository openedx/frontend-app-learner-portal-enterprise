import { Sticky, Image } from "@edx/paragon";
import edx from "../../assets/images/edx/edx.png";

const StickyHeader = () => {
  return (
    <Sticky className="sticky">
      <div className="header">
        <Image className="mr-2" src={edx} rounded alt="Image description" />
        <div className="heading-text">
          <h2 className="text-warning-400 text-justify">Skills builder</h2>
          <h3 className="text-light-100 text-justify">Let edX be your guide</h3>
        </div>
      </div>
    </Sticky>
  );
};

export default StickyHeader;
