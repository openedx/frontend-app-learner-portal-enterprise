import { Helmet } from "react-helmet";
import { SKILL_BUILDER_TITLE, text } from "./constants";
import SkillBuilderForm from "./SkillBuilderForm";
import "./styles/index.scss";
import StickyHeader from "./StickyHeader";

const SkillBuilderPage = () => {
  const TITLE = `edx - ${SKILL_BUILDER_TITLE}`;
  return (
    <>
      <Helmet title={TITLE} />
      <StickyHeader />
      <div className="page-body">
        <div className="text">
          <p className="text-gray-600 text-justify">{text}</p>
        </div>
        <SkillBuilderForm />
      </div>
    </>
  );
};
export default SkillBuilderPage;
