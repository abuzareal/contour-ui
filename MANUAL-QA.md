# Manual screen-reader check guide

VoiceOver (Mac) and NVDA (Windows) read a page aloud. These checks need a person to listen: an automated test cannot know whether the spoken name, state or error makes sense. You do not need to share a recording or private data. Use synthetic fixture values only. **No session is claimed as completed by this guide.**

## Prepare the public fixture

From a public repository checkout at the exact commit being checked, run npm ci --ignore-scripts, npm run build, then npm run qa:preview. Open http://127.0.0.1:5177 in the browser being checked. Record the package/source commit, OS version, browser version and screen-reader version. These are local fixture results, not production deployment proof. Stop the preview with Ctrl+C afterward.

For VoiceOver use Safari on Mac and turn VoiceOver on with Command+F5 (some keyboards also require Fn), or through the Accessibility settings. For NVDA use a Windows machine with NVDA and Firefox. Browser/OS keyboard navigation settings can affect Tab behavior; record the settings rather than changing the application to hide the difference. Consult the screen reader's own help for reading/navigation commands.

## Scenarios to listen to

1. Read the heading and local-only notice. Move to Name: its label, required state and hint should make sense. Change it, submit, inspect the actual visible payload, then reset and check Ada returns.
2. Move to Allow updates and Notifications. Check the announced name/checked state, Space activation and FormData omission when unchecked. No fake success or silent data save should be suggested.
3. Move to Project. Open the picker, type part of a label, use arrows and select. Confirm the announced field name, expanded/collapsed state, highlighted/selected choice and disabled choice. Test the long translated label and no matches. Typed text must not become an arbitrary submitted ID.
4. With the picker open, press Tab and Shift+Tab. Confirm the list closes and the newly focused control is readable, with no dead/hidden keyboard target. Try reading outside the popup with the screen-reader cursor as well as keyboard focus. Record any inaccessible background, duplicate announcements or lost position; do not presume the static finding is harmless.
5. Open Confirm settings. Check the title/description, initial Review note focus, Tab containment, Escape close and focus return to the connected previously focused opener. Safari pointer clicks do not necessarily focus buttons; this fixture explicitly focuses its opener before opening. Repeat Project help and its Escape/focus return.
6. Repeat relevant controls in dark mode (?theme=dark), narrow width, high browser zoom and RTL (?rtl=1). Distinguish browser zoom from display scaling and CSS zoom. Check long labels/errors do not clip essential controls.
7. In actual copied async/confirmation recipes, listen for loading/error/retry and safe cancellation. Confirm destructive success is announced only after a real caller-confirmed result. A failed request should leave a readable persistent error. Record the exact recipe/service fixture used; do not claim these paths from the basic static form alone.

## Result record

| Field                                 | Record  |
| ------------------------------------- | ------- |
| Date, reviewer and synthetic fixture  | Pending |
| Package/source commit/archive         | Pending |
| OS / browser / screen reader versions | Pending |
| Scenario / exact keyboard steps       | Pending |
| Expected name/state/announcement      | Pending |
| Actual observed announcement/focus    | Pending |
| Pass / fail / blocked / not attempted | Pending |
| Reproduction / issue / fix / retest   | Pending |

Mark unattempted scenarios explicitly. A passing session covers only its recorded environment/scenarios. QA-13 and QA-14 remain open until actual results exist; preparing this guide does not close them. Substantive findings need fixes or public limitations, and the strict automated findings remain independently recorded in SUPPORT.md.

## Version and reproduction

Reference version **0.6.1** (candidate until published). [Versioned source](https://github.com/abuzareal/contour-ui/tree/v0.6.1/src) and [emitted type inventory](PUBLIC-API.md) describe this contract; tag links resolve after release. [Report Manual accessibility 0.6.1](https://github.com/abuzareal/contour-ui/issues/new?template=bug_report.yml&component=Manual%20accessibility&version=0.6.1), using the [public minimal reproduction](examples/reproduction) and synthetic data.
