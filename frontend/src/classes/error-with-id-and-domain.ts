import ErrorWithID from "./error-with-id";

export interface ErrorWithIDAndDomainInterface {
  domain: string;
  id: number;
  value: Error;
}

export default class ErrorWithIDAndDomain
  extends ErrorWithID
  implements ErrorWithIDAndDomainInterface
{
  domain: string;

  constructor(error: unknown, domain: string, prefix?: string, suggestedId?: number) {
    super(error, prefix, suggestedId);
    this.domain = domain;
  }
}
