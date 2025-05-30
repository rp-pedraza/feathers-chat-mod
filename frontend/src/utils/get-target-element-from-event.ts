const getTargetElementFromEvent = <T extends HTMLElement>(event: Event): T => {
  const target = event.target;

  if (target === null) {
    throw new Error("Event target element is null");
  }

  return target as T;
};

export default getTargetElementFromEvent;
