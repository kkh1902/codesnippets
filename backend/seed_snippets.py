from app.core.database import SessionLocal
from app.models.post import Post
from datetime import datetime

def seed_snippets():
    db = SessionLocal()

    try:
        # Sample posts (using category string instead of category_id)
        posts_data = [
            {
                "title": "Python List Comprehension",
                "content": """# 간단한 리스트 컴프리헨션 예제

```python
# 1부터 10까지의 제곱수 리스트 생성
squares = [x**2 for x in range(1, 11)]
print(squares)  # [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

# 짝수만 필터링
evens = [x for x in range(1, 11) if x % 2 == 0]
print(evens)  # [2, 4, 6, 8, 10]
```

리스트 컴프리헨션은 Python에서 리스트를 간결하게 생성하는 방법입니다.""",
                "language": "python",
                "author": "Admin",
                "category": "python",
                "tags": "python,list-comprehension,basics"
            },
            {
                "title": "FastAPI CRUD Example",
                "content": """# FastAPI를 사용한 기본 CRUD 엔드포인트

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

class Item(BaseModel):
    id: int
    name: str
    description: str = None

items: List[Item] = []

@app.post("/items/")
async def create_item(item: Item):
    items.append(item)
    return item

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    for item in items:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")
```

FastAPI로 RESTful API를 쉽게 만들 수 있습니다.""",
                "language": "python",
                "author": "Admin",
                "category": "python",
                "tags": "fastapi,api,crud"
            },
            {
                "title": "JavaScript Array Methods",
                "content": """# 자주 사용하는 배열 메서드 모음

```javascript
const numbers = [1, 2, 3, 4, 5];

// map: 각 요소 변환
const doubled = numbers.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// filter: 조건에 맞는 요소만
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens); // [2, 4]

// reduce: 하나의 값으로 축약
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log(sum); // 15

// find: 첫 번째 매칭 요소
const found = numbers.find(n => n > 3);
console.log(found); // 4
```

JavaScript 배열 메서드를 활용하면 데이터 처리가 쉬워집니다.""",
                "language": "javascript",
                "author": "Admin",
                "category": "javascript",
                "tags": "javascript,array,methods"
            },
            {
                "title": "React useState Hook",
                "content": """# React의 useState 훅 사용 예제

```typescript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <p>Hello, {name}!</p>
    </div>
  );
}

export default Counter;
```

useState는 함수형 컴포넌트에서 상태를 관리하는 기본 훅입니다.""",
                "language": "typescript",
                "author": "Admin",
                "category": "react",
                "tags": "react,hooks,useState"
            },
            {
                "title": "React useEffect Hook",
                "content": """# 데이터 페칭과 정리를 위한 useEffect 예제

```typescript
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();

        if (isMounted) {
          setUser(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    }

    fetchUser();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [userId]); // userId가 변경될 때마다 실행

  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}
```

useEffect는 사이드 이펙트를 처리하는 훅입니다.""",
                "language": "typescript",
                "author": "Admin",
                "category": "react",
                "tags": "react,hooks,useEffect,data-fetching"
            },
            {
                "title": "Promise와 Async/Await",
                "content": """# JavaScript 비동기 처리 방법

```javascript
// Promise 사용
function fetchDataPromise() {
  return fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// Async/Await 사용
async function fetchDataAsync() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// 여러 Promise 동시 실행
async function fetchMultiple() {
  const [users, posts] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json())
  ]);

  return { users, posts };
}
```

비동기 처리는 모던 JavaScript의 핵심입니다.""",
                "language": "javascript",
                "author": "Admin",
                "category": "javascript",
                "tags": "javascript,async,promise,fetch"
            },
            {
                "title": "Python Decorators",
                "content": """# 데코레이터 기본 사용법

```python
import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.2f} seconds")
        return result
    return wrapper

def retry(max_attempts=3):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f"Attempt {attempt + 1} failed: {e}")
            return None
        return wrapper
    return decorator

@timer
@retry(max_attempts=3)
def fetch_data():
    # 데이터 가져오기
    pass
```

데코레이터를 사용하면 함수의 동작을 확장할 수 있습니다.""",
                "language": "python",
                "author": "Admin",
                "category": "python",
                "tags": "python,decorators,advanced"
            },
            {
                "title": "React Custom Hook",
                "content": """# 재사용 가능한 커스텀 훅 만들기

```typescript
import { useState, useEffect } from 'react';

// 로컬 스토리지와 동기화하는 커스텀 훅
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  }, [key, value]);

  return [value, setValue];
}

// 사용 예시
function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}
```

커스텀 훅으로 로직을 재사용하세요.""",
                "language": "typescript",
                "author": "Admin",
                "category": "react",
                "tags": "react,custom-hooks,localStorage"
            }
        ]

        # Add posts to database
        for post_data in posts_data:
            post = Post(**post_data)
            db.add(post)

        db.commit()
        print(f"✅ Successfully added {len(posts_data)} sample posts!")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_snippets()
