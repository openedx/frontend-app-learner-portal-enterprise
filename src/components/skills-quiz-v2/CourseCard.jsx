import { Card } from '@edx/paragon';

const CourseCard = () => (
  <Card>
    <Card.ImageCap
      src="fakeURL"
      srcAlt="Card image"
      logoSrc="fakeURL"
      fallbackLogoSrc="https://www.edx.org/images/logos/edx-logo-elm.svg"
      logoAlt="Card logo"
    />
    <Card.Header title="Title" subtitle="Subtitle" />
    <Card.Section title="Section title">
      This is a card section. It can contain anything but usually text, a list, or list of links.
      Multiple sections have a card divider between them.
    </Card.Section>
  </Card>
);
export default CourseCard;
