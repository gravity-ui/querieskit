---
name: code-review-checklist
description: Applies the Code Review Checklist (logical bugs, edge cases, security, performance) when reviewing code, checking logic, or hunting bugs. Use on any request for code review, проверку логики, поиск багов, or bug hunting in code.
---

# **Code Review Checklist**

## **Logical Bugs Checklist**

### **Control Flow**

- All branches are reachable and necessary
- No dead code paths
- Loop conditions terminate correctly
- Switch/case has default or is exhaustive
- Early returns don't skip necessary cleanup
- Conditional logic matches the intent (off-by-one, inverted conditions)

### **Null & Undefined Handling**

- Null checks before dereferencing
- Optional chaining used where appropriate
- Default values for missing fields
- No assumptions about object shape without validation

### **Error Handling**

- Errors caught at appropriate level
- No swallowed errors (empty catch blocks)
- Error propagation preserves context
- Graceful degradation on failure
- Resource cleanup in finally blocks

### **Concurrency & Race Conditions**

- Shared mutable state is protected
- No race conditions in async code
- Locks/mutexes used correctly where needed
- Callbacks don't cause interleaving issues
- Atomicity of compound operations guaranteed

### **State Management**

- State transitions are valid and complete
- No stale state after updates
- State not mutated directly (where immutable pattern expected)
- Derived state recomputed when dependencies change
- No state leaks between independent operations

### **Data Flow**

- Data transformations preserve invariants
- No data loss in type conversions
- Array/object mutations don't affect unexpected references
- Input validation at boundaries
- Output consistency with input constraints

## **Edge Cases Checklist**

### **Boundary Conditions**

- Empty collections handled
- Zero / negative values handled
- Maximum values don't overflow
- String length edge cases (empty, very long, unicode)
- Date/time edge cases (timezones, leap years, midnight)

### **Resource Management**

- File handles closed after use
- Network connections properly terminated
- Database connections returned to pool
- Event listeners removed when no longer needed
- Temporary resources cleaned up

### **Integration Points**

- API contracts honored (request/response shapes)
- External service failures handled gracefully
- Backward compatibility maintained for public interfaces
- Breaking changes identified and documented
- Migration paths exist for schema changes

## **Security Checklist**

### **Input Validation**

- All user inputs are validated
- Input sanitization applied where needed
- Type checking enforced
- Boundary conditions handled

### **SQL Injection**

- Parameterized queries used
- No string concatenation for SQL
- ORM methods used correctly

### **XSS (Cross-Site Scripting)**

- Output encoding applied
- No `dangerouslySetInnerHTML` without sanitization
- URL parameters validated

### **Authentication & Authorization**

- Proper authentication checks
- Authorization verified for each endpoint
- Session management secure

### **Secrets & Credentials**

- No hardcoded secrets
- Environment variables used for sensitive data
- No credentials in logs

## **Performance Checklist**

### **Database**

- N+1 queries avoided
- Proper indexes exist
- Query optimization applied

### **Memory**

- No memory leaks
- Large objects handled efficiently
- Caching used where appropriate

### **Algorithms**

- Appropriate data structures used
- Time complexity acceptable
- No nested loops that could be optimized
