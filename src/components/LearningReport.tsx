import { loadLearningRecords } from '../utils/storage';

export default function LearningReport() {
  const records = loadLearningRecords().slice(0, 8);

  return (
    <div className="learning-report">
      <h3>学习记录</h3>
      {records.length === 0 ? (
        <p>还没有闯关记录。</p>
      ) : (
        <ul>
          {records.map((record, index) => (
            <li key={`${record.date}-${record.gameId}-${record.level}-${index}`}>
              第 {record.level} 关：{record.learningGoal}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
