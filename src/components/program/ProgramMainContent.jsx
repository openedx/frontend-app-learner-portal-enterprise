import ProgramInstructors from './ProgramInstructors';
import ProgramCourses from './ProgramCourses';
import { PreviewExpand } from '../preview-expand';
import BulletList from './BulletList';
import { useProgramDetails } from '../app/data';

const ProgramMainContent = () => {
  const { data: program } = useProgramDetails();
  const { expectedLearningItems, overview } = program;
  return (
    <div className="program-main-content">
      {expectedLearningItems && expectedLearningItems.length > 0 && (
        <PreviewExpand
          className="mb-5"
          cta={{
            labelToExpand: 'Expand what you\'ll learn',
            labelToMinimize: 'Collapse what you\'ll learn',
            id: 'what-youll-learn',
          }}
          heading={<h3>What you&apos;ll learn</h3>}
        >
          <div><BulletList items={expectedLearningItems} /></div>
        </PreviewExpand>
      )}
      {overview && (
        <PreviewExpand
          className="mb-5"
          cta={{
            labelToExpand: 'More about this program',
            labelToMinimize: 'Collapse about this program',
            id: 'about-this-course',
          }}
          heading={<h3>About this program</h3>}
        >
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: overview }} />
        </PreviewExpand>
      )}
      <ProgramCourses />
      <ProgramInstructors />
    </div>
  );
};

export default ProgramMainContent;
