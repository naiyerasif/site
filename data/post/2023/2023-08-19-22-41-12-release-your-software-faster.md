---
slug: "2023/08/19/release-your-software-faster"
title: "Release your software faster"
date: 2023-08-19 22:41:12
update: 2023-08-19 22:41:12
type: "opinion"
---

:::figure
> Release early. Release often. And listen to your ~~customers~~ <ins>users</ins>.

::caption[[Eric Raymond](http://www.catb.org/~esr/writings/cathedral-bazaar/cathedral-bazaar/ar01s04.html) (paraphrased), :time[2002-08-02T09:02:14]]
:::

In general, do what's sensible for your users, and applicable to your project.

In particular,

- **Cut down what to ship in a release.** Small changes are easier to build and test. Users can offer more effective feedback on them. Feedback loops are small and specific. Specific feedback is a product improvement gold.
- **Separate functional stuff from technical**. Keep maintenance and security patches separate from functional pieces to reduce surprises due to breaking changes. Even better, plan a predictable cadence for such patches to production. Streamline your strategy for such releases since they may not require full regression or acceptance testing.
- **Automate relentlessly.** Not only security scans and tests, automate tiny workflows like PR checks (you don't have to review formatting changes or whitespace differences), password and token rotation, PR merge and version bumps, version movement in different environments, etc. Reduce friction in your routine to focus on things that genuinely need your attention.
- **Make things better, not worse.** Embrace feedback from your users, and tune the software. Make it boring. Make it fade away. [People don't want to use your software](/post/2019/08/15/people-dont-want-to-use-your-software/); they want to live a good life and be happy. Don't let your software stand in their way. If a release makes things worse, roll it back. Don't compromise on quality over speed.
