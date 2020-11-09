import { Link } from 'core/structs';

interface Action {
  type: string;
  payload: Record<any, any>;
}

export type ViewType = 'paragraph' | 'line';

interface FocusLinkAction extends Action {
  type: 'focusLink';
  payload: { link: Link };
}

interface UnFocusLinkAction extends Action {
  type: 'unFocusLink';
  payload: { link: Link };
}

interface SetLinksAction extends Action {
  type: 'setLinks';
  payload: { links: Link[] };
}

interface SwitchViewAction extends Action {
  type: 'switchView';
  payload: { view: ViewType };
}

interface AddSourceRefAction extends Action {
  type: 'addSourceRef';
  payload: { position: number; ref: HTMLDivElement };
}

interface AddTargetRefAction extends Action {
  type: 'addTargetRef';
  payload: { position: number; ref: HTMLDivElement };
}

interface AddParentRefAction extends Action {
  type: 'addParentRef';
  payload: { ref: HTMLDivElement };
}

interface ChangeSourceTextDirection extends Action {
  type: 'changeSourceTextDirection';
  payload: { textDirection: 'ltr' | 'rtl' };
}

interface ChangeTargetTextDirection extends Action {
  type: 'changeTargetTextDirection';
  payload: { textDirection: 'ltr' | 'rtl' };
}

interface ToggleSelectedSourceTextSegment extends Action {
  type: 'toggleSelectedSourceTextSegment';
  payload: { position: number };
}

interface ToggleSelectedTargetTextSegment extends Action {
  type: 'toggleSelectedTargetTextSegment';
  payload: { position: number };
}

interface selectSourceTextSegment extends Action {
  type: 'selectSourceTextSegment';
  payload: { position: number };
}

interface selectTargetTextSegment extends Action {
  type: 'selectTargetTextSegment';
  payload: { position: number };
}

interface RedrawUI extends Action {
  type: 'redrawUI';
  payload: {};
}

interface AddLink extends Action {
  type: 'addLink';
  payload: { sources: number[]; targets: number[] };
}

interface RemoveLink extends Action {
  type: 'removeLink';
  payload: { sources: number[]; targets: number[] };
}

interface ResetSelectedSegments extends Action {
  type: 'resetSelectedSegments';
  payload: {};
}

interface SetInProgressLink extends Action {
  type: 'setInProgressLink';
  payload: Link;
}

export type AlignmentActionTypes =
  | FocusLinkAction
  | UnFocusLinkAction
  | SetLinksAction
  | SwitchViewAction
  | AddSourceRefAction
  | AddTargetRefAction
  | AddParentRefAction
  | ChangeSourceTextDirection
  | ChangeTargetTextDirection
  | ToggleSelectedSourceTextSegment
  | ToggleSelectedTargetTextSegment
  | selectSourceTextSegment
  | selectTargetTextSegment
  | RedrawUI
  | AddLink
  | RemoveLink
  | ResetSelectedSegments
  | SetInProgressLink;

export type AlignmentState = {
  focusedLinks: Map<Link, boolean>;
  links: Link[];
  view: ViewType;
  sourceRefs: Record<number, HTMLDivElement>;
  targetRefs: Record<number, HTMLDivElement>;
  parentRef: HTMLDivElement | null;
  sourceTextDirection: 'ltr' | 'rtl';
  targetTextDirection: 'ltr' | 'rtl';
  selectedSourceTextSegments: Record<number, boolean>;
  selectedTargetTextSegments: Record<number, boolean>;
  inProgressLink: Link | null;
};

export const initialState: AlignmentState = {
  focusedLinks: new Map<Link, boolean>(),
  links: [],
  view: 'paragraph',
  sourceRefs: {},
  targetRefs: {},
  parentRef: null,
  sourceTextDirection: 'ltr',
  targetTextDirection: 'ltr',
  selectedSourceTextSegments: {},
  selectedTargetTextSegments: {},
  inProgressLink: null,
};

export const reducer = (
  state: AlignmentState,
  action: AlignmentActionTypes
): AlignmentState => {
  console.log('REDUCER', action, state);
  switch (action.type) {
    case 'focusLink':
      const newFocusedLinks = new Map<Link, boolean>(state.focusedLinks);
      newFocusedLinks.set(action.payload.link, true);
      return { ...state, focusedLinks: newFocusedLinks };
    case 'unFocusLink':
      const newUnFocusedLinks = new Map<Link, boolean>(state.focusedLinks);
      newUnFocusedLinks.set(action.payload.link, false);
      return { ...state, focusedLinks: newUnFocusedLinks };
    case 'setLinks':
      return { ...state, links: action.payload.links };
    case 'switchView':
      return { ...state, view: action.payload.view };
    case 'addSourceRef':
      return {
        ...state,
        sourceRefs: {
          ...state.sourceRefs,
          [action.payload.position]: action.payload.ref,
        },
      };
    case 'addTargetRef':
      return {
        ...state,
        targetRefs: {
          ...state.targetRefs,
          [action.payload.position]: action.payload.ref,
        },
      };
    case 'addParentRef':
      return { ...state, parentRef: action.payload.ref };
    case 'changeSourceTextDirection':
      return { ...state, sourceTextDirection: action.payload.textDirection };
    case 'changeTargetTextDirection':
      return { ...state, targetTextDirection: action.payload.textDirection };
    case 'toggleSelectedSourceTextSegment':
      return {
        ...state,
        selectedSourceTextSegments: {
          ...state.selectedSourceTextSegments,
          [action.payload.position]: !state.selectedSourceTextSegments[
            action.payload.position
          ],
        },
      };
    case 'toggleSelectedTargetTextSegment':
      return {
        ...state,
        selectedTargetTextSegments: {
          ...state.selectedTargetTextSegments,
          [action.payload.position]: !state.selectedTargetTextSegments[
            action.payload.position
          ],
        },
      };

    case 'selectSourceTextSegment':
      return {
        ...state,
        selectedSourceTextSegments: {
          ...state.selectedSourceTextSegments,
          [action.payload.position]: true,
        },
      };
    case 'selectTargetTextSegment':
      return {
        ...state,
        selectedTargetTextSegments: {
          ...state.selectedTargetTextSegments,
          [action.payload.position]: true,
        },
      };

    case 'redrawUI':
      return { ...state, parentRef: null };
    case 'addLink':
      return {
        ...state,
        links: state.links.reduce<Link[]>(
          (acc: Link[], curr: Link, index: number, array: Link[]) => {
            const relatedSources = action.payload.sources.find((source) => {
              return curr.sources.includes(source);
            });
            const relatedTargets = action.payload.targets.find((target) => {
              return curr.targets.includes(target);
            });

            if (relatedSources || relatedTargets) {
              return acc.concat([
                {
                  sources: curr.sources.concat(action.payload.sources),
                  targets: curr.targets.concat(action.payload.targets),
                  type: 'manual',
                },
              ]);
            }

            if (
              index === array.length - 1 &&
              !relatedSources &&
              !relatedTargets
            ) {
              return acc.concat([
                {
                  sources: action.payload.sources,
                  targets: action.payload.targets,
                  type: 'manual',
                },
              ]);
            }

            return acc.concat([curr]);
          },
          []
        ),
        selectedSourceTextSegments: {},
        selectedTargetTextSegments: {},
        inProgressLink: null,
      };

    case 'removeLink':
      return {
        ...state,
        inProgressLink: null,
        links: state.links.filter((link) => {
          const foundSource = link.sources.find((sourcePos) => {
            return action.payload.sources.includes(sourcePos);
          });

          const foundTarget = link.targets.find((targetPos) => {
            return action.payload.targets.includes(targetPos);
          });

          return !foundSource && !foundTarget;
        }),
      };

    case 'resetSelectedSegments':
      return {
        ...state,
        selectedSourceTextSegments: {},
        selectedTargetTextSegments: {},
        inProgressLink: null,
      };

    case 'setInProgressLink':
      return { ...state, inProgressLink: action.payload };

    default:
      return state;
  }
};
