# How to set up Google Sign In for Fun and Profit

Enable the 'Google Sign In' OAuth API in the [Google Cloud API manager](https://console.developers.google.com/) by filling out the consent form:

- [X] Application name
- [X] Application Logo
- [ ] Support email (support@chefcapp.com the dream)
- [X] Selected scopes ("Google Sign In": [email, profile, openid]) - [see below](#considerations-for-additional-api-scopes).
- [ ] Authorized domains that we have registered (i.e. chefcapp.com)
- [ ] Link to Application Homepage
- [ ] Link to Privacy Policy
- [ ] Link to Terms of Service

*List accurate as of 23/07/2020*

## Considerations for Additional API Scopes

I'd recommend a bit of an investigation to see if there's other API scopes that could be of use beyond the ones needed to power OAuth Sign In. Also should factor in delays from review and how complete our documentation (Privacy, ToS) is before we dip our toes here?

## Potential for delay

There may be a verification process ('up to several weeks') if we meet certain criteria, from the horse's mouth:

>Verification is required if your app is marked as Public and at least one of the following is true:
>
>- Your app uses a sensitive and/or restricted scope
>- **Your app displays an icon on its OAuth consent screen**
>- Your app has a large number of authorised domains
>- You have made changes to a previously verified OAuth consent screen

I suspect icons might get a few days at best as they run it through the porn filter, so it's probably not a deal breaker if we're strapped for time. Best to get it out of the way the first time.

