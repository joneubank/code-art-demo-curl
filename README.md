# Interactive Code-Art Development Template

Use this to develop your own generative art algorithms!

Write your code-art algorithm and watch it render in real time in the browser. Interact with the canvas to change input parameters to see changes to the generated art. Use the psuedo-random number generated provided by the [@code-not-art/core](https://github.com/code-not-art/core) drawing library to add random effects. Cycle through different random generator seeds for both the image and its random colour selections. When you are ready to share your work, this app is ready to be hosted as a static web page.

All this and more with these few simple steps!

This template is mostly a wrapper around [@code-not-art/sketch](https://github.com/code-not-art/sketch), if you want to see what is happening under the hood.

## Steps

1. Use this template:

   [How To](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)

   Click the big **Use This Template** button and fill out the form to make a new repository based off this one.

1. **Clone** to your computer:

   [How To](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/adding-and-cloning-repositories/cloning-a-repository-from-github-to-github-desktop)

1. **Install** dependencies with npm:

   ```sh
   npm ci
   ```

1. **Run** the development server:

   ```sh
   npm start
   ```

   If successful, it will show that the server is running on `localhost:1234`. You can open this page in a browser of your choice. It should show a blank canvas.

   Note: The canvas is completely transparent by default. The grey colour shown is just the background behind the canvas.

1. **Write** your sketch the code in your IDE of choice:

   The code for your sketch lives in `src/sketch.ts`. This file exports a `Sketch` object that will be rendered by the App.

   As you make your code, art will be generated on the canvas in the browser as you save changes.

   You can change the page title and meta description properties by modifying the `App` element in `src/index.tsx`.

   Note: This is a basic ReactJS application, and you can modify it as you would any other React app. If you have a good idea for features to add to this dev environment, feel free to [open an issue](https://github.com/code-not-art/template/issues) with your suggestions and we can determine the best place to add those features for other users (likely in the [sketch](https://github.com/code-not-art/sketch) library used by this template).

## Interacting With the Canvas

Once your sketch is rendering in the browser, you can interact with it both through the parameter control menu and through keyboard controls.

### Keyboard Controls

TLDR: Spacebar to regenerate, arrow keys to change only colour or image, S to save

| **Key** |                                      **Action**                                       |
| :-----: | :-----------------------------------------------------------------------------------: |
|   `s`   |                              **Save** the current image                               |
|   `u`   | Shareable image **URL** - Create a shareable URL and copy that link to your clipboard |
|   `m`   |                             Show/Hide Parameter **Menu**                              |
|         |                                                                                       |
| `space` |                 Draw **new image** with random image and color seeds.                 |
|   `↑`   | Move to **next color** seed, or generate a new one if at end of list. Draw new image. |
|   `↓`   |                   Move to **previous color** seed. Draw new image.                    |
|   `→`   | Move to **next image** seed, or generate a new one if at end of list. Draw new image. |
|   `←`   |                   Move to **previous image** seed. Draw new image.                    |
|   `c`   |                     Generate new **color** seed. Draw new image.                      |
|   `i`   |                     Generate new **image** seed. Draw new image.                      |
