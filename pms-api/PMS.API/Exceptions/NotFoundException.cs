namespace PMS.API.Exceptions;

public class NotFoundException(string entity, object id)
    : Exception($"{entity} with id {id} was not found.");
