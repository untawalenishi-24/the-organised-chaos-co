# The Organised Chaos Co.

A responsive, static website for HR, recruitment and business operations.

## Development

From this checkout, start a local server:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

No package installation, build, API keys or backend are required. All images and fonts are served locally. JavaScript enhances the mobile menu, section navigation, reveals and scroll depth; content and links remain available without it. Reduced-motion preferences disable animated effects.

The neumorphic surfaces use soft bevels, recessed controls and embossed details. The hero and section headings arrive word by word, with the hero's italic accent settling into place and a fine underline drawing beneath “clarity.” Supporting elements have a staggered entrance. Headings retain their complete accessible names throughout the animation, then stay still for reading.

Native scrolling moves a camera between photo and story, sideways through service panels, and around the approach cards in depth. The alignment scene, counter-moving typography, leather-card folio entrance and footer reveal continue that spatial direction. A floating story note and recessed background reliefs move vertically at different speeds. Desktop pointer movement changes the light on card surfaces. Effects run in response to input and finish at rest; there is no continuous animation loop. Each panel has direct arrow controls; keyboard focus brings a service email action into view.

Sticky scenes are enabled only after measuring the viewport and actual reading content. Short windows and larger text receive swipeable galleries with arrow controls when a scene cannot fit comfortably. Reduced motion removes the title entrances, parallax, camera choreography and sticky sections; the galleries remain directly navigable. Without JavaScript, content returns to normal document flow. The contact cards use larger cream text on continuous dark leather surfaces with recessed edges, quiet original texture, numbered insets and ivory action buttons.

Contact links open an email composer addressed to `controlroom@theorganisedchaosco.com`. The discovery call link requests a call by email; it does not reserve a calendar slot.

## Hosting and domain

The domain is registered through GoDaddy. The repository's `CNAME` declares `theorganisedchaosco.com`, which is consistent with a GitHub Pages custom domain.

To confirm the deployment, inspect this repository's **Settings → Pages** for the publishing source, custom domain and HTTPS status, and GoDaddy's DNS records for the destination of the root domain and `www`. Domain registration and website hosting are separate services.

If GitHub Pages is the configured host, these files can be published directly from the configured branch/root; no application server or build step is necessary. Confirm the publishing source in the original repository, `untawalenishi-24/the-organised-chaos-co`, before deploying changes from a fork.

## Visual assets and fonts

All original photographs, background textures and both logo files are preserved byte for byte. The existing Cormorant Garamond and Inter font families are self-hosted as variable WOFF2 files, with Latin character subsets for this English-language site.

Font sources: [Cormorant Garamond](https://github.com/google/fonts/tree/main/ofl/cormorantgaramond) and [Inter](https://github.com/google/fonts/tree/main/ofl/inter). Their SIL Open Font License notices are included in `fonts/`.

## Validation

The redesign was exercised in Chromium at seven phone, tablet and desktop viewport sizes. Checks cover assets and fonts, complete scene traversal, direct controls, focused email actions, full-scroll overflow, touch gestures, mobile menus, reduced motion and operation without JavaScript. Motion checks also cover heading names, stable hero geometry, completed animations, vertical parallax and pointer light. Twenty-five axe-core WCAG A/AA audits covered the visible scene panels, contact area and illuminated desktop surfaces without violations.
