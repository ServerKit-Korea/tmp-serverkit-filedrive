export class Queue<T> {
    private items: T[] = [];

    // 큐의 맨 뒤에 요소를 추가
    enqueue(input: T | T[]): void {
        if (Array.isArray(input)) {
            this.items.push(...input); // 배열인 경우 배열을 펼쳐서 추가
        } else {
            this.items.push(input); // 단일 항목인 경우 그냥 추가
        }
    }

    // 큐의 맨 앞에서 요소를 제거하고 반환
    dequeue(): T | undefined {
        return this.items.shift();
    }

    // 큐의 맨 앞 요소를 반환하되, 제거하지 않음
    peek(): T | undefined {
        return this.items[0];
    }

    // 큐가 비어있는지 확인
    isEmpty(): boolean {
        return this.items.length === 0;
    }

    // 큐의 크기 반환
    size(): number {
        return this.items.length;
    }
}
