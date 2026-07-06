import fs from "node:fs";

it("groups documents once instead of filtering every category during render", () => {
  const documentChecklist = fs.readFileSync("components/documents/DocumentChecklist.tsx", "utf8");

  expect(documentChecklist).toContain("useMemo");
  expect(documentChecklist).toContain("documentsByCategory");
  expect(documentChecklist).not.toContain("documents.filter((doc) => doc.category === group)");
});

it("keeps code-split workspace views from rendering a blank shell while loading", () => {
  const appShell = fs.readFileSync("components/AppShell.tsx", "utf8");

  expect(appShell).toContain("function ViewLoading");
  expect(appShell).not.toContain("dynamicViewOptions");
  expect(appShell).toMatch(/dynamic\(\(\) => import\("\.\/dashboard\/DashboardView"\), \{ loading: \(\) => <ViewLoading \/> \}\)/);
  expect(appShell).toMatch(/dynamic\(\(\) => import\("\.\/documents\/DocumentChecklist"\), \{ loading: \(\) => <ViewLoading \/> \}\)/);
  expect(appShell).toMatch(/dynamic\(\(\) => import\("\.\/FloatingChat"\), \{ loading: \(\) => <ViewLoading \/> \}\)/);
});

it("keeps persisted browser state out of the first client render", () => {
  const appShell = fs.readFileSync("components/AppShell.tsx", "utf8");

  expect(appShell).toContain("const [state, dispatch] = useReducer(appReducer, initialState);");
  expect(appShell).not.toContain("() => loadPersistedState() ?? initialState");
  expect(appShell).not.toContain("useState(() => loadQuickStartDismissed())");
  expect(appShell).toMatch(/useEffect\(\(\) => \{\s+const persistedState = loadPersistedState\(\);/);
});
