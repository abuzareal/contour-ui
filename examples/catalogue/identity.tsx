import {
  BrandMark,
  Reveal,
  SectionLabel,
  RevealHeading,
  GitHubIcon,
  LinkedInIcon,
  ExternalLink,
} from "@abuzareal/contour-ui";

export default function Identity() {
  return (
    <>
      <BrandMark label="Legacy aa identity example" href="#work-title" />
      <Reveal>
        <SectionLabel
          section={{
            id: "work",
            number: 1,
            label: "Work",
            title: "Selected work",
          }}
          aside="Example"
        />
        <RevealHeading id="work-title" lines={[{ text: "Selected work" }]} />
      </Reveal>
      <ExternalLink href="https://github.com" aria-label="GitHub">
        <GitHubIcon />
      </ExternalLink>
      <ExternalLink href="https://www.linkedin.com" aria-label="LinkedIn">
        <LinkedInIcon />
      </ExternalLink>
    </>
  );
}
