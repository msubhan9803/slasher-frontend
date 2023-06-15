# Slasher Web Frontend

## Development Notes

This project currently uses Node 16.  It's recommended that you install Node via NVM because it makes management of multiple Node versions easier.

See: https://github.com/nvm-sh/nvm

Specifically, were targeting Node 16.13.1 (as indicated by the top level .nvmrc file).

Also make sure that you're using a version of NPM that's at least 8.2.0.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Capacitor

This app can also be built into a Capacitor app (https://capacitorjs.com).  Below are some quick references for useful commands:

`npm run build` - Run this before `npx cap sync`, beause `npx cap sync` will sync the build to the android and ios project directories.

`npx cap sync` - This command runs `npx cap copy` and then `npx cap update` behind the scenes.  Run this before running or building the Android or iOS apps.  You can also run `npx cap sync android` or `npx cap sync ios` if you're only targeting one of those platforms at a time.

`npx cap open android` - Open the Android project (in Android Studio)

`npx cap open ios` - Open the Android project (in XCode)

So when building for Android, locally, you'll probably often run this:

`npm run build && npx cap sync android && npx cap run android`

For a production build, make sure to read in the correct production environment variables.  This may look something like this:

`set -o allexport && source ./deploy-cloudflare/.env.deploy/prod && npm run build && npx cap sync android && npx cap run android`

**Running capacitor app with backend server connected for development with live reload:**

Note: You need to get your local ip address of your machine, usually it looks like `192.168.18.5` (we will consider this ip for our example in below steps so you **must use your own ip address**).

1. Run `cp .env.capacitor.local-network-ip.template .env.capacitor.local-network-ip` to create an environment file and update your actual machine ip address of wifi network in it i.e, `LOCAL_MACHINE_IP=http://192.168.18.5:3000` in our case. This points to local react server which would be helpful for live-reload while development.
2. In frontend create a file with name `.env.development.local` in the project root directory. Then add an environment variable `REACT_APP_API_URL=http://192.168.18.5:4000`.
3. In backend open `.env.development` file and add an environment variable `API_URL=http://192.168.18.5:4000`. (Note: This is helpful for backend to provide correct image urls for the api responses).

Now you can start run frontend via `npm start`, run backend via `npm run start:dev` followed by running capacitor app via `npm run cap-live-reload-android` or `npm run cap-live-reload-ios` for appropriate device you want to run the app on with live reload.

**Updating capacitor app icon and splash screen:**

Docs: [Click here](https://capacitorjs.com/docs/guides/splash-screens-and-icons)

You can add/update icons and splash screen in `resources` directory by running `npx capacitor-assets generate` script and then regenerating the apk would get new/updated app-icon and splash screen.

**Passing environement variables to capacitor native builds:**

- `.env` file is used when `npm run cap-static-build-android` or `npm run cap-static-build-ios` is used.
- `.env.development`/`.env.development.local` is used when we use `npm run cap-live-reload-android` or `npm run cap-live-reload-ios`.

**Viewing console logs in capacitor live-reload build and static builds:**

When you need to see console logs of a native capacitor app running on a real device (or Android Emulator) you can use below url in *Google Chrome Browser* to get access the debugging-console:

`chrome://inspect/#devices` (bookmark the url for reliability)


## App Structure

Below is a general overview of our app structure, with some example subdirectories that show naming conventions.

### Here are the conventions we're trying to follow, whenever possible:
- Use `snake-case` for directories
- Use `PascalCase` for modules that have a React component as a default export (e.g. `MyComponent.tsx`)
- For non-component modules with only one default export, use `camelCase` (it makes imports easier since the variable name matches the module file name).
- For non-component modules with NO default export, use `snake-case`.

In addition to the above rules, always try to use `.ts`/`.tsx` rather than `.js/.jsx` because this is a TypeScript project.

There will be certain times where a library that we use recommends that we use a file naming convention that doesn't match up with the above rules.  In those cases, it's fine to follow the library's convention.  One example of this is react-testing-library, which recommends the creation of a file under `src` named `setupTests.ts`.  Normally we'd use `camel-case` for a file like this, but in this case we will go with react-testing-library's recommendation.

```
.
|── /src
    ├── /components
        ├── # globally shared components go in here
    ├── /images
    ├── /routes
        ├── # page and routing components go in here
        ├── home
            ├── # Note that this directory matches the full browser route
            ├── Home.tsx
        ├── dating
            ├── components # put any shared "dating" section components in here
                ├── SomeSharedComponent.tsx # single file for simple component
                ├── DatingAdditionalInfo
                    ├── # This directory is named after the component inside because it is composed from multiple files
                    ├── DatingAdditionalInfo.tsx
                    ├── additional-info-form-options.tsx
            ├── setup
                ├── additional-info
                    ├── # Note that this directory matches the full browser route
                    ├── DatingSetupAdditionalInfo.tsx
            ├── profile
                ├── edit
                    ├── # Note that this directory matches the full browser route
                    ├── DatingProfileEdit.tsx
    ├── /styles
        ├── # Global styles go here
    ├── /utils
        ├── # Shared utility classes go here (array utils, date, utils, etc.)
```
