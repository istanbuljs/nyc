## Change Log

### v5.6.0 (2016/02/03 +7:00)

- [#159](https://github.com/bcoe/nyc/pull/159) skip should continue working with source-maps (@novemberborn)
- [#160](https://github.com/bcoe/nyc/pull/160) don't instrument files outside of the current working directory (@novemberborn)

### v5.5.0 (2016/01/24 +07:00)

- [#152](https://github.com/bcoe/nyc/pull/152) upgrade to newest version of foreground-child (@isaacs)
- [#150](https://github.com/bcoe/nyc/pull/150) guard against illegal positions in source-map (@novemberborn)

### v5.4.0 (2016/01/20 +07:00)

- [#147](https://github.com/bcoe/nyc/pull/147) fix for foreground-child on Windows (@isaacs)
- [#145](https://github.com/bcoe/nyc/pull/145) allow coverage output directory to be specified (@bcoe)
- [#143](https://github.com/bcoe/nyc/pull/143) run files included via --all through transpilers (@bcoe)
- [#139](https://github.com/bcoe/nyc/pull/139) documentation updates (@tcurdt)
- [#138](https://github.com/bcoe/nyc/pull/138) Split CLI from spawn wrapper (@isaacs)

### v5.3.0 (2016/01/05 14:07 -08:00)

- [#132](https://github.com/bcoe/nyc/pull/132/files) Move config to top level nyc argument. (@jamestalmage)

### v5.2.0 (2016/01/02 17:13 -08:00)

- [#126](https://github.com/bcoe/nyc/pull/126) Add --check-coverage shorthand, which fails tests if coverage slips below threshold (@bcoe)
- [#123](https://github.com/bcoe/nyc/pull/123) Upgrade spawn-wrap, foreground-child (@isaacs)
- [#122](https://github.com/bcoe/nyc/pull/122) Use module for finding cache directory (@jamestalmage)

### v5.1.1 (2015/12/30 14:52 -08:00)

- [#121](https://github.com/bcoe/nyc/pull/121) Fix for --all functionality. (@jamestalmage)

### v5.1.0 (2015/12/27 20:36 -08:00)

- [#108](https://github.com/bcoe/nyc/pull/108) Adds cache functionality. this is a big one, thanks! (@jamestalmage)
- [#118](https://github.com/bcoe/nyc/pull/118) Stop bundling spawn-wrap dependency (@bcoe)
- [#114](https://github.com/bcoe/nyc/pull/114) Update to latest versions of tap, glob, rimraf (@isaacs)
- [#107](https://github.com/bcoe/nyc/pull/107) Get test-suite running on Windows (@bcoe)

### v5.0.1 (2015/12/14 09:09 -07:00)

- [#94](https://github.com/bcoe/nyc/pull/93) Windows failed if argument had no replace() method. (@bcoe)

### v5.0.0 (2015/12/09 11:03 -07:00)

- [#87](https://github.com/bcoe/nyc/pull/87) make spawn() work on Windows (@bcoe)
- [#84](https://github.com/bcoe/nyc/pull/84) glob based include/exclude of files (@Lalem001)
- [#78](https://github.com/bcoe/nyc/pull/78) improvements to sourcemap tests (@novemberborn)
- [#73](https://github.com/bcoe/nyc/pull/73) improvements to require tests (@novemberborn)
- [#65](https://github.com/bcoe/nyc/pull/65) significant improvements to require hooks (@novemberborn)
- [#64](https://github.com/bcoe/nyc/pull/64) upgrade Istanbul (@novemberborn)

### v4.0.0 (2015/11/29 10:13 -07:00)

- [#58](https://github.com/bcoe/nyc/pull/58) adds support for Babel (@bcoe)

### v3.2.2 (2015/09/11 22:02 -07:00)

- [#47](https://github.com/bcoe/nyc/pull/47) make the default exclude rules work on Windows (@bcoe)
- [#45](https://github.com/bcoe/nyc/pull/45) pull in patched versions of spawn-wrap and foreground-child, which support Windows (@bcoe)
- [#44](https://github.com/bcoe/nyc/pull/44) Adds --all option which adds 0% coverage reports for all files in project, regardless of whether code touches them (@ronkorving)

### v3.1.0 (2015/08/02 19:04 +00:00)

- [#38](https://github.com/bcoe/nyc/pull/38) fixes for windows spawning (@rmg)

### v3.0.1 (2015/07/25 20:51 +00:00)
- [#33](https://github.com/bcoe/nyc/pull/33) spawn istanbul in a way that is less likely to break npm@3.x (@bcoe)

### v3.0.0 (2015/06/28 19:49 +00:00)

- [#31](https://github.com/bcoe/nyc/pull/31) Combine instrumentation and reporting steps, based
  on @Raynos' suggestion (@bcoe)

### v2.4.0 (2015/06/24 15:57 +00:00)
- [#30](https://github.com/bcoe/nyc/pull/30) Added check-coverage functionality, thanks
  @Raynos! (@bcoe)

### v2.3.0 (2015/06/04 06:43 +00:00)
- [#27](https://github.com/bcoe/nyc/pull/27) upgraded tap, and switched tests to using tap --coverage (@bcoe)
- [#25](https://github.com/bcoe/nyc/pull/25) support added for multiple reporters, thanks @jasisk! (@jasisk)

### v2.2.0 (2015/05/25 21:05 +00:00)
- [b2e4707](https://github.com/bcoe/nyc/commit/b2e4707ca16750fe274f61039baf1cabdd6b0149) change location of nyc_output to .nyc_output. Added note about coveralls comments. (@sindresorhus)

### v2.1.3 (2015/05/25 06:30 +00:00)
- [376e328](https://github.com/bcoe/nyc/commit/376e32871d2d65ca31e7d8ba691293ac3ba6117e) handle corrupt JSON files in nyc_output (@bcoe)

### v2.1.1 (2015/05/25 02:52 +00:00)
- [b39dec5](https://github.com/bcoe/nyc/commit/b39dec5a7fb9004be72d024d5d1df2984dd21a52) new signal-exit handles process.exit() in process.on('exit') (@isaacs)

### v2.1.0 (2015/05/23 20:55 +00:00)
- [ad13b30](https://github.com/bcoe/nyc/commit/ad13b30cf263ccc3607e1707ebdf582345ce90fe) added CHANGELOG.md \o/ (@bcoe)
- [53fef48](https://github.com/bcoe/nyc/commit/53fef4820e7b502d00561fb5d16f5bfb4b641192) put tests around @shackpank's work on .istanbul.yml (@bcoe)
- [da81c54](https://github.com/bcoe/nyc/commit/da81c5427c2dee38496def9741fdde5524fa0942) upgrade spawn-wrap and foreground-child (@isaacs)
- [4f69327](https://github.com/bcoe/nyc/commit/4f69327b5e6247770bf299fab86abb67a042b26a) pin tap until new version of nyc can be pulled in (@bcoe)

### v2.0.6 (2015/05/23 06:52 +00:00)
- [cd70a41](https://github.com/bcoe/nyc/commit/cd70a414adc12b79770eaca9e8ca0e5f954924f3) upgrade signal-exit (@bcoe)

### v2.0.5 (2015/05/20 05:44 +00:00)
- [#11](https://github.com/bcoe/nyc/pull/11) Merge pull request #11 from bcoe/exlude-docs (@bcoe)

### v2.0.4 (2015/05/19 04:58 +00:00)
- [4d920ef](https://github.com/bcoe/nyc/commit/4d920ef6e0843729a911ca1cf6deaf6645e21f60) ensure that writing code coverage always happens last (@bcoe)

### v2.0.3 (2015/05/18 01:52 +00:00)
- [94d2693](https://github.com/bcoe/nyc/commit/94d2693739cf7145333d941c88e0d3af9592c1d6) spawn-wrap@0.1.1 (@isaacs)

### v2.0.1 (2015/05/18 01:46 +00:00)
- [62c2cb0](https://github.com/bcoe/nyc/commit/62c2cb0941fbda8aa5ef6ba4877c02a046b68c6c) upgrade signal-exit dependency (@bcoe)

### v2.0.0 (2015/05/16 21:38 +00:00)
- [d27794e](https://github.com/bcoe/nyc/commit/d27794e3c527ccf743501f328b9749f1bcf9cefe) got rid of nyc-report bin (@bcoe)
- [64c9824](https://github.com/bcoe/nyc/commit/64c98241db36331b611cf990343da40d5f45685a) added better documentation and CLI. (@bcoe)

### v1.4.1 (2015/05/16 19:23 +00:00)
- [ae05346](https://github.com/bcoe/nyc/commit/ae0534617a59c86905f1da290d067945bf7d1bb9) pulled in new version of signal-exit (@bcoe)

### v1.4.0 (2015/05/16 09:11 +00:00)
- [8ca6e16](https://github.com/bcoe/nyc/commit/8ca6e16f6ecb7fa488944cd00d84ae5d355345d2) pulled in signal-exit module (@bcoe)

### v1.3.0 (2015/05/15 15:56 +00:00)
- [0f701da](https://github.com/bcoe/nyc/commit/0f701da5aa3ad8a02872c4c6c8c37d0deb2c5877) pulled in new spawn-wrap, various bug fixes (@isaacs)

### v1.2.0 (2015/05/13 20:21 +00:00)
- [2611ba4](https://github.com/bcoe/nyc/commit/2611ba44f12a25c12c0f95a9bdcfbf905dbb070f) handle signals when writing coverage report (@bcoe)

### v1.1.3 (2015/05/11 18:31 +00:00)
- [8b362d6](https://github.com/bcoe/nyc/commit/8b362d600845722943c1da8213f0406d6b3a3874) istanbul has a text lcov report now \o/ (@bcoe)

### v1.1.2 (2015/05/11 06:52 +00:00)
- [48b21cf](https://github.com/bcoe/nyc/commit/48b21cf3b35f6d14d35ac9afdd423ead09a2368e) added coverage and build badges (@bcoe)

### v1.1.0 (2015/05/10 01:32 +00:00)
- [6c3f8a6](https://github.com/bcoe/nyc/commit/6c3f8a6147c376e87a22c4a72a1ab28ab4177349) pulled in @isaacs spawn-wrap module (@isaacs)
- [d8956f1](https://github.com/bcoe/nyc/commit/d8956f170f12a8a27cc3f7611f78230393bf105b) we now pass cwd around using the process.env.NYC_CWD variable (@bcoe)
