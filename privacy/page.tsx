export const metadata = {
  title: 'Privacy Policy | GameHub',
  description: 'GameHub privacy policy — learn what information GameHub stores and how it is used.'
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <a href="/gamehub/">← GameHub</a>
      <h1>Privacy Policy</h1>
      <p>Last updated: September 14, 2026</p>

      <h2>What GameHub collects</h2>
      <p>
        GameHub is designed to work without accounts. Game progress, personal bests, preferences, and recently played games may be stored locally in your browser. We do not require your name, email address, or account to play.
      </p>

      <h2>Analytics</h2>
      <p>
        GameHub has a provider-neutral analytics event system for events such as a game being opened, started, restarted, or finished. These events are currently handled locally by the site and are not sent to an external analytics provider unless a provider is explicitly configured in a future release.
      </p>

      <h2>Local storage</h2>
      <p>
        Some games use browser local storage to remember scores, preferences, and recently played games. You can clear this data through your browser settings. Clearing local storage may reset saved game progress and personal bests.
      </p>

      <h2>Advertising and cookies</h2>
      <p>
        GameHub does not currently serve Google AdSense advertisements. If advertising is enabled in the future, Google and other third-party advertising vendors may use cookies or similar technologies to serve and measure advertisements, including personalized advertising based on a visitor&apos;s prior visits to this or other websites, subject to applicable settings and consent requirements.
      </p>
      <p>
        Google&apos;s use of advertising cookies enables Google and its partners to serve ads based on visits to GameHub and other sites. Where applicable, visitors can opt out of personalized advertising through <a href="https://adssettings.google.com/" rel="noopener noreferrer">Google Ads Settings</a>. Visitors may also review available third-party advertising opt-out information through <a href="https://optout.aboutads.info/" rel="noopener noreferrer">AboutAds.info</a>.
      </p>
      <p>
        Before advertising is enabled for users who require consent, GameHub will provide the applicable consent controls and update this policy as required by Google and applicable privacy laws.
      </p>

      <h2>Third-party services</h2>
      <p>
        GameHub is hosted on GitHub Pages. Third-party services may process technical information according to their own policies. If additional third-party services are introduced, this policy will be updated where appropriate.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions, please contact the GameHub project owner through the project repository.
      </p>
    </main>
  );
}
