workflow "Deploy" {
  on = "push"
  resolves = ["Publish"]
}

action "OnlyRelease" {
  uses = "actions/bin/filter@master"
  args = "branch release"
}

action "Publish" {
  uses = "JamesIves/github-pages-deploy-action@release"
  needs = ["OnlyRelease"]
  env = {
    BRANCH = "master"
    BASE_BRANCH = "release"
    BUILD_SCRIPT = "npm install && npm run build"
    FOLDER = "public"
    COMMIT_EMAIL = "naiyer.app@gmail.com"
    COMMIT_NAME = "Microflash"
  }
  secrets = ["ACCESS_TOKEN"]
}
