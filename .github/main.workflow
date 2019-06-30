workflow "Deploy" {
  on = "push"
  resolves = ["Publish"]
}

action "OnlyRelease" {
  uses = "actions/bin/filter@release"
  args = "branch release"
}

action "Publish" {
  uses = "JamesIves/github-pages-deploy-action@master"
  needs = ["OnlyRelease"]
  env = {
    BRANCH = "master"
    BUILD_SCRIPT = "npm install && npm run build"
    FOLDER = "public"
  }
  secrets = ["ACCESS_TOKEN"]
}
