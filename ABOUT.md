# Evidence Room v1.0

Evidence Room is a local-first browser application for reviewing duplicate and visually similar image files before taking action. It is designed to keep the final decision with the person who owns the files.

## How it works

Choose a local folder, scan its image files, mark visible candidates, and then choose between moving them into an **Evidence Room Recycling Bin** folder or deleting them now. The browser requests read/write access only when needed. File contents, scan results, file handles, and the session activity log stay in memory for the current page session and are not uploaded or saved by the app.

## Privacy and safety

The app does not provide a server-side file store or account history. Closing or reloading the page clears the current session. Permanent deletion is irreversible; the recycling-bin option should be preferred when there is any uncertainty.

## License

Evidence Room is distributed under the GNU General Public License. See [`LICENSE`](./LICENSE) and [`NOTICE.md`](./NOTICE.md) for the applicable copyright, license, and attribution information.
